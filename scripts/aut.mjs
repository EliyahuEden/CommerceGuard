import { spawn, execFileSync } from "node:child_process"
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { resolve } from "node:path"
import { randomBytes } from "node:crypto"
import { applyStorefront } from "./storefront.mjs"
import {
  assertTestDatabase,
  aut,
  databaseUrl,
  pin,
  pnpm,
  root,
  run,
  runtime,
  waitFor,
} from "./lib.mjs"

const backend = resolve(aut, "apps/backend")
const storefront = resolve(aut, "apps/storefront")
const command = process.argv[2]
const stateFile = resolve(runtime, "processes.json")
function checkPin() {
  const actual = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: aut,
    encoding: "utf8",
    windowsHide: true,
  }).trim()
  if (actual !== pin.commit) throw new Error(`AUT commit mismatch: ${actual}`)
}
function service(name, cwd, args) {
  const production = name === "storefront" && args.includes("start")
  const log = openSync(resolve(runtime, `${name}.log`), "a")
  const child = spawn(
    process.execPath,
    [resolve(root, "node_modules/pnpm/bin/pnpm.cjs"), ...args],
    {
      cwd,
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        NODE_ENV: production ? "production" : "development",
        MEDUSA_DISABLE_TELEMETRY: "true",
        NEXT_TELEMETRY_DISABLED: "1",
      },
      detached: true,
      windowsHide: true,
      stdio: ["ignore", log, log],
    },
  )
  child.unref()
  return {
    name,
    pid: child.pid,
    ...(name === "storefront"
      ? { mode: production ? "production" : "development" }
      : {}),
  }
}
function frontendArgs(mode = process.env.CG_STOREFRONT_MODE || "development") {
  if (!["production", "development"].includes(mode))
    throw new Error("CG_STOREFRONT_MODE must be production or development")
  return [
    "exec",
    "next",
    mode === "production" ? "start" : "dev",
    ...(mode === "development" ? ["--webpack"] : []),
    "-p",
    "8000",
  ]
}
async function buildStorefront() {
  applyStorefront()
  const startedAt = new Date().toISOString()
  try {
    await pnpm(["exec", "next", "build", "--webpack"], storefront, {
      ...process.env,
      NODE_ENV: "production",
      NEXT_TELEMETRY_DISABLED: "1",
    })
    writeFileSync(
      resolve(runtime, "storefront-build.json"),
      JSON.stringify(
        {
          startedAt,
          finishedAt: new Date().toISOString(),
          status: "passed",
          commit: pin.commit,
          node: process.versions.node,
        },
        null,
        2,
      ),
    )
  } catch (error) {
    writeFileSync(
      resolve(runtime, "storefront-build.json"),
      JSON.stringify(
        {
          startedAt,
          finishedAt: new Date().toISOString(),
          status: "failed",
          error: error.message,
        },
        null,
        2,
      ),
    )
    throw error
  }
}
function ownsProcess(pid) {
  if (!Number.isSafeInteger(pid) || pid < 1) return false
  try {
    const command =
      process.platform === "win32"
        ? execFileSync(
            "powershell.exe",
            [
              "-NoProfile",
              "-NonInteractive",
              "-Command",
              `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; (Get-CimInstance Win32_Process -Filter 'ProcessId = ${pid}').CommandLine`,
            ],
            {
              encoding: "utf8",
              windowsHide: true,
              stdio: ["ignore", "pipe", "ignore"],
            },
          )
        : existsSync(`/proc/${pid}/cmdline`)
          ? readFileSync(`/proc/${pid}/cmdline`, "utf8")
          : execFileSync("ps", ["-p", String(pid), "-o", "command="], {
              encoding: "utf8",
              stdio: ["ignore", "pipe", "ignore"],
            })
    const normalized = command.replaceAll("\\", "/").toLowerCase()
    return (
      normalized.includes(root.replaceAll("\\", "/").toLowerCase()) &&
      normalized.includes("node_modules/pnpm/bin/pnpm.cjs")
    )
  } catch {
    return false
  }
}
function stopService(pid) {
  // PIDs can be reused after an interrupted session or reboot. Verify the
  // workspace command before terminating a process tree, even with saved state.
  if (!ownsProcess(pid)) return
  try {
    if (process.platform === "win32")
      execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], {
        windowsHide: true,
        stdio: "ignore",
      })
    else process.kill(-pid, "SIGTERM")
  } catch {
    /* already stopped */
  }
}
async function warmStorefront() {
  const seed = JSON.parse(readFileSync(resolve(runtime, "seed.json"), "utf8"))
  const results = []
  const paths = process.env.CG_WARM_PATHS
    ? JSON.parse(process.env.CG_WARM_PATHS)
    : [
        "/dk",
        "/dk/about",
        "/dk/store",
        "/dk/cart",
        "/dk/account",
        "/dk/account/profile",
        "/dk/account/orders",
        "/dk/wishlist",
        `/dk/products/${seed.handle}`,
        "/dk/checkout",
        "/dk/order/order_commerceguard_warmup/confirmed",
      ]
  for (const path of paths) {
    if (
      typeof path !== "string" ||
      !path.startsWith("/dk") ||
      path.startsWith("//")
    )
      throw new Error("Invalid local warmup path")
    const started = Date.now()
    const response = await fetch(`http://localhost:8000${path}`, {
      signal: AbortSignal.timeout(180_000),
    })
    await response.text()
    // Missing cart/order is expected for these non-mutating compilation probes.
    // The real scenarios subsequently create their own cart/order and assert 200.
    if (!response.ok && response.status !== 404)
      throw new Error(`Warmup ${path}: HTTP ${response.status}`)
    results.push({
      path,
      status: response.status,
      duration: Date.now() - started,
    })
  }
  writeFileSync(
    resolve(runtime, "warmup.json"),
    JSON.stringify(results, null, 2),
  )
}
switch (command) {
  case "prepare": {
    if (!existsSync(resolve(aut, ".git"))) {
      await run("git", ["clone", pin.repository, aut])
    }
    await run("git", ["checkout", "--detach", pin.commit], { cwd: aut })
    checkPin()
    await pnpm(["install", "--frozen-lockfile"])
    // Disable only the unrelated admin dashboard, preserving storefront/API behavior.
    const config = readFileSync(resolve(backend, "medusa-config.ts"), "utf8")
    if (!config.includes("disable: true")) {
      writeFileSync(
        resolve(backend, "medusa-config.ts"),
        config.replace(
          "defineConfig({",
          "defineConfig({\n  admin: { disable: true },",
        ),
      )
    }
    copyFileSync(
      resolve(root, "aut/seed.ts"),
      resolve(backend, "src/scripts/commerceguard-seed.ts"),
    )
    copyFileSync(
      resolve(root, "aut/catalog.ts"),
      resolve(backend, "src/scripts/commerceguard-catalog.ts"),
    )
    copyFileSync(
      resolve(root, "aut/readiness.tsx"),
      resolve(storefront, "src/app/commerceguard-readiness.tsx"),
    )
    const layoutPath = resolve(storefront, "src/app/layout.tsx")
    let layout = readFileSync(layoutPath, "utf8")
    if (!layout.includes("<CommerceGuardReadiness")) {
      layout =
        'import CommerceGuardReadiness from "./commerceguard-readiness"\n' +
        layout
      layout = layout.replace(
        "{props.children}</main>",
        "{props.children}</main>\n        <CommerceGuardReadiness />",
      )
      writeFileSync(layoutPath, layout)
    }
    applyStorefront()
    console.log(
      `Prepared ${pin.commit}. Third-party source stays in ignored .aut/.`,
    )
    break
  }
  case "init": {
    assertTestDatabase()
    checkPin()
    const envPath = resolve(backend, ".env")
    if (!existsSync(envPath))
      writeFileSync(
        envPath,
        [
          `DATABASE_URL=${databaseUrl}`,
          "STORE_CORS=http://localhost:8000,http://127.0.0.1:8000",
          "ADMIN_CORS=http://localhost:9000",
          "AUTH_CORS=http://localhost:8000,http://localhost:9000,http://127.0.0.1:8000",
          `JWT_SECRET=${randomBytes(32).toString("hex")}`,
          `COOKIE_SECRET=${randomBytes(32).toString("hex")}`,
          "",
        ].join("\n"),
      )
    await pnpm(
      [
        "exec",
        "medusa",
        "db:migrate",
        "--execute-safe-links",
        "--execute-safe-search",
        "--json",
      ],
      backend,
      {
        ...process.env,
        DATABASE_URL: databaseUrl,
        MEDUSA_DISABLE_TELEMETRY: "true",
      },
    )
    break
  }
  case "seed": {
    assertTestDatabase()
    copyFileSync(
      resolve(root, "aut/catalog.ts"),
      resolve(backend, "src/scripts/commerceguard-catalog.ts"),
    )
    copyFileSync(
      resolve(root, "aut/seed.ts"),
      resolve(backend, "src/scripts/commerceguard-seed.ts"),
    )
    await pnpm(
      [
        "exec",
        "medusa",
        "exec",
        "./src/scripts/commerceguard-seed.ts",
        "--json",
      ],
      backend,
      {
        ...process.env,
        DATABASE_URL: databaseUrl,
        MEDUSA_DISABLE_TELEMETRY: "true",
        COMMERCEGUARD_SEED_PATH: resolve(runtime, "seed.json"),
        COMMERCEGUARD_CATALOG_PATH: resolve(root, "storefront/catalog.json"),
      },
    )
    const seed = JSON.parse(readFileSync(resolve(runtime, "seed.json"), "utf8"))
    writeFileSync(
      resolve(storefront, ".env.local"),
      [
        "NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000",
        `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${seed.publishableKey}`,
        "NEXT_PUBLIC_BASE_URL=http://localhost:8000",
        "NEXT_PUBLIC_DEFAULT_REGION=dk",
        "COMMERCEGUARD_LOCAL_TEST=true",
        "",
      ].join("\n"),
    )
    console.log(
      "Seed exported. Restart storefront after changing its environment.",
    )
    break
  }
  case "start-production":
  case "start": {
    if (command === "start-production")
      process.env.CG_STOREFRONT_MODE = "production"
    assertTestDatabase()
    checkPin()
    // A cold Medusa start can outlive the readiness budget. Resume the owned
    // backend-only state instead of requiring a healthy backend to restart.
    const processes = existsSync(stateFile)
      ? JSON.parse(readFileSync(stateFile, "utf8")).filter((value) =>
          ownsProcess(value.pid),
        )
      : []
    if (!processes.length)
      processes.push(service("backend", backend, ["exec", "medusa", "develop"]))
    if (processes.length !== 1 || processes[0].name !== "backend")
      throw new Error(
        "Process state exists. Run npm run aut:stop before starting again.",
      )
    writeFileSync(stateFile, JSON.stringify(processes))
    await waitFor("http://127.0.0.1:9000/health", 300_000)
    if (process.env.CG_STOREFRONT_MODE === "production") await buildStorefront()
    processes.push(service("storefront", storefront, frontendArgs()))
    writeFileSync(stateFile, JSON.stringify(processes))
    await waitFor("http://localhost:8000/dk/store", 300_000)
    await warmStorefront()
    console.log(
      "Medusa API :9000 and storefront :8000 are ready. Logs: .runtime/",
    )
    break
  }
  case "restart-storefront": {
    checkPin()
    const processes = JSON.parse(readFileSync(stateFile, "utf8"))
    const index = processes.findIndex((value) => value.name === "storefront")
    if (index < 0) throw new Error("No owned storefront to restart")
    stopService(processes[index].pid)
    // Wait for the old server to release its port before launching its replacement.
    for (let attempt = 0; attempt < 30; attempt++) {
      try {
        await fetch("http://localhost:8000/dk/cart", {
          signal: AbortSignal.timeout(1000),
        })
      } catch {
        break
      }
      await new Promise((done) => setTimeout(done, 250))
    }
    const mode =
      process.env.CG_STOREFRONT_MODE || processes[index].mode || "development"
    if (mode === "production") await buildStorefront()
    processes[index] = service("storefront", storefront, frontendArgs(mode))
    writeFileSync(stateFile, JSON.stringify(processes))
    await waitFor("http://localhost:8000/dk/store", 300_000)
    await warmStorefront()
    console.log("Storefront restarted and source changes compiled.")
    break
  }
  case "build-storefront": {
    checkPin()
    const processes = existsSync(stateFile)
      ? JSON.parse(readFileSync(stateFile, "utf8"))
      : []
    const index = processes.findIndex((value) => value.name === "storefront")
    const mode =
      process.env.CG_STOREFRONT_MODE || processes[index]?.mode || "development"
    if (index >= 0) stopService(processes[index].pid)
    let succeeded = false
    try {
      await buildStorefront()
      succeeded = true
    } finally {
      if (index >= 0) {
        processes[index] = service(
          "storefront",
          storefront,
          frontendArgs(succeeded ? mode : "development"),
        )
        writeFileSync(stateFile, JSON.stringify(processes))
        await waitFor("http://localhost:8000/dk/store", 300_000)
        await warmStorefront()
      }
    }
    break
  }
  case "typecheck-storefront":
    checkPin()
    await pnpm(["exec", "tsc", "--noEmit"], storefront)
    break
  case "typecheck-backend":
    checkPin()
    await pnpm(["exec", "tsc", "--noEmit"], backend)
    break
  case "stop": {
    if (!existsSync(stateFile)) break
    for (const { pid } of JSON.parse(
      readFileSync(stateFile, "utf8"),
    ).reverse()) {
      stopService(pid)
    }
    const { unlinkSync } = await import("node:fs")
    unlinkSync(stateFile)
    console.log(
      "Stopped CommerceGuard-owned application process trees. Database is managed separately.",
    )
    break
  }
  default:
    throw new Error(
      "Usage: node scripts/aut.mjs prepare|init|seed|start|ready|stop|restart-storefront|build-storefront|typecheck-storefront",
    )
}
