import { spawn } from "node:child_process"
import { existsSync, mkdirSync, readFileSync } from "node:fs"
import { resolve, dirname, delimiter } from "node:path"
import { fileURLToPath } from "node:url"

export const root = fileURLToPath(new URL("../", import.meta.url))
const [major, minor, patch] = process.versions.node.split(".").map(Number)
if (major !== 22 || minor < 23 || (minor === 23 && patch < 4)) {
  throw new Error(
    "CommerceGuard setup requires Node 22.23.4 or a later Node 22 patch. Switch Node versions before running setup.",
  )
}
// pnpm's generated executable shims must use this same runtime, even when the
// caller invoked an absolute portable node.exe without changing the shell PATH.
process.env.PATH = dirname(process.execPath) + delimiter + process.env.PATH
export const aut = resolve(root, ".aut/dtc-starter")
export const runtime = resolve(root, ".runtime")
mkdirSync(runtime, { recursive: true })
if (existsSync(resolve(root, ".env")))
  process.loadEnvFile(resolve(root, ".env"))
export const databaseUrl =
  process.env.DATABASE_URL ||
  "postgres://commerceguard:commerceguard_local@127.0.0.1:54329/commerceguard_test"
export const pin = JSON.parse(
  readFileSync(resolve(root, "config/aut.json"), "utf8"),
)
export function assertTestDatabase() {
  const url = new URL(databaseUrl)
  if (
    !["localhost", "127.0.0.1"].includes(url.hostname) ||
    url.pathname !== "/commerceguard_test"
  ) {
    throw new Error(
      "Setup is restricted to local database commerceguard_test. Refusing another target.",
    )
  }
}
export function run(command, args, options = {}) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      windowsHide: true,
      ...options,
    })
    child.on("error", reject)
    child.on("exit", (code) =>
      code === 0
        ? resolveResult()
        : reject(new Error(`${command} exited ${code}`)),
    )
  })
}
export function pnpm(args, cwd = aut, env = process.env) {
  return run(
    process.execPath,
    [resolve(root, "node_modules/pnpm/bin/pnpm.cjs"), ...args],
    { cwd, env },
  )
}
export async function waitFor(url, timeout = 180_000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(
          Math.max(1, Math.min(60_000, timeout - (Date.now() - start))),
        ),
      })
      // Drain streamed Next.js HTML so a ready shell is not mistaken for a fully
      // rendered/warmed route, and avoid abandoning the server response.
      await response.text()
      if (response.ok) return
    } catch {
      /* service is still starting */
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 1000))
  }
  throw new Error(`Readiness timeout: ${url}. Inspect .runtime/*.log`)
}
