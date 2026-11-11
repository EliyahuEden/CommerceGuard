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
  const log = openSync(resolve(runtime, `${name}.log`), "a")
  const child = spawn(
    process.execPath,
    [resolve(root, "node_modules/pnpm/bin/pnpm.cjs"), ...args],
    {
      cwd,
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        NODE_ENV: "development",
        MEDUSA_DISABLE_TELEMETRY: "true",
        NEXT_TELEMETRY_DISABLED: "1",
      },
      detached: true,
      windowsHide: true,
      stdio: ["ignore", log, log],
    },
  )
  child.unref()
  return { name, pid: child.pid }
}
function stopService(pid) {
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
  for (const path of [
    "/dk/store",
    "/dk/cart",
    "/dk/account",
    "/dk/account/profile",
    "/dk/account/orders",
    `/dk/products/${seed.handle}`,
    "/dk/checkout",
    "/dk/order/order_commerceguard_warmup/confirmed",
  ]) {
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
        "",
      ].join("\n"),
    )
    console.log(
      "Seed exported. Restart storefront after changing its environment.",
    )
    break
  }
  case "start": {
    assertTestDatabase()
    checkPin()
    if (existsSync(stateFile))
      throw new Error(
        "Process state exists. Run npm run aut:stop before starting again.",
      )
    const processes = [
      service("backend", backend, ["exec", "medusa", "develop"]),
    ]
    writeFileSync(stateFile, JSON.stringify(processes))
    await waitFor("http://127.0.0.1:9000/health")
    processes.push(
      service("storefront", storefront, [
        "exec",
        "next",
        "dev",
        "--webpack",
        "-p",
        "8000",
      ]),
    )
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
    processes[index] = service("storefront", storefront, [
      "exec",
      "next",
      "dev",
      "--webpack",
      "-p",
      "8000",
    ])
    writeFileSync(stateFile, JSON.stringify(processes))
    await waitFor("http://localhost:8000/dk/store", 300_000)
    await warmStorefront()
    console.log("Storefront restarted and source changes compiled.")
    break
  }
  case "ready":
    await waitFor("http://127.0.0.1:9000/health")
    await waitFor("http://localhost:8000/dk/store", 300_000)
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
      "Usage: node scripts/aut.mjs prepare|init|seed|start|ready|stop",
    )
}
