import {
  existsSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  mkdirSync,
  unlinkSync,
} from "node:fs"
import { createHash } from "node:crypto"
import { resolve, dirname } from "node:path"
import { spawn } from "node:child_process"
import pgClient from "pg"
import { assertTestDatabase, databaseUrl, runtime, root, run } from "./lib.mjs"

assertTestDatabase()
const url = new URL(databaseUrl)
// Windows PostgreSQL initdb cannot reliably encode non-ASCII data directory paths.
const databaseDir =
  process.platform === "win32"
    ? resolve(
        process.env.LOCALAPPDATA,
        "CommerceGuard",
        createHash("sha256").update(root).digest("hex").slice(0, 12),
        "postgres",
      )
    : resolve(runtime, "postgres")
writeFileSync(resolve(runtime, "portable-db-location.txt"), databaseDir)
let pg
if (process.platform === "win32") {
  // The binary's installation path must also be ASCII (PostgreSQL loads SQL from share/).
  const binaries = resolve(dirname(databaseDir), "native")
  const platform = await import("@embedded-postgres/windows-x64")
  function copyTree(source, destination) {
    mkdirSync(destination, { recursive: true })
    for (const entry of readdirSync(source, { withFileTypes: true })) {
      if (entry.isDirectory())
        copyTree(resolve(source, entry.name), resolve(destination, entry.name))
      else
        writeFileSync(
          resolve(destination, entry.name),
          readFileSync(resolve(source, entry.name)),
        )
    }
  }
  if (!existsSync(resolve(binaries, "share/postgres.bki")))
    copyTree(dirname(dirname(platform.postgres)), binaries)
  writeFileSync(
    resolve(binaries, "EMBEDDED-POSTGRES-LICENSE.md"),
    readFileSync(resolve(dirname(dirname(platform.postgres)), "../LICENSE.md")),
  )
  mkdirSync(dirname(databaseDir), { recursive: true })
  if (!existsSync(resolve(databaseDir, "PG_VERSION"))) {
    const passwordFile = resolve(dirname(databaseDir), "init-password")
    writeFileSync(passwordFile, url.password, { mode: 0o600 })
    try {
      await run(
        resolve(binaries, "bin/initdb.exe"),
        [
          "-D",
          databaseDir,
          "-U",
          url.username,
          "--pwfile",
          passwordFile,
          "--encoding=UTF8",
          "--locale=C",
          "--auth=scram-sha-256",
        ],
        { cwd: binaries },
      )
    } finally {
      unlinkSync(passwordFile)
    }
  }
  const child = spawn(
    resolve(binaries, "bin/postgres.exe"),
    ["-D", databaseDir, "-h", "127.0.0.1", "-p", url.port],
    { cwd: binaries, windowsHide: true, stdio: "inherit" },
  )
  child.on("error", (error) => {
    throw error
  })
  pg = {
    initialise: async () => {},
    start: async () => {
      for (let attempt = 0; attempt < 30; attempt++) {
        const probe = new pgClient.Client({
          connectionString: databaseUrl.replace(
            "/commerceguard_test",
            "/postgres",
          ),
        })
        try {
          await probe.connect()
          await probe.end()
          return
        } catch {
          await probe.end().catch(() => {})
        }
        await new Promise((done) => setTimeout(done, 1000))
      }
      throw new Error("Portable PostgreSQL readiness timeout")
    },
    getPgClient: () =>
      new pgClient.Client({
        connectionString: databaseUrl.replace(
          "/commerceguard_test",
          "/postgres",
        ),
      }),
    createDatabase: async () => {
      const admin = new pgClient.Client({
        connectionString: databaseUrl.replace(
          "/commerceguard_test",
          "/postgres",
        ),
      })
      await admin.connect()
      try {
        await admin.query("CREATE DATABASE commerceguard_test")
      } finally {
        await admin.end()
      }
    },
    stop: () =>
      run(
        resolve(binaries, "bin/pg_ctl.exe"),
        ["-D", databaseDir, "-m", "fast", "-w", "stop"],
        { cwd: binaries },
      ),
  }
} else {
  const { default: EmbeddedPostgres } = await import("embedded-postgres")
  pg = new EmbeddedPostgres({
    databaseDir,
    user: url.username,
    password: url.password,
    port: Number(url.port),
    persistent: true,
    initdbFlags: ["--encoding=UTF8", "--locale=C"],
    postgresFlags: ["-h", "127.0.0.1"],
  })
}
if (!existsSync(resolve(databaseDir, "PG_VERSION"))) await pg.initialise()
await pg.start()
const client = pg.getPgClient()
await client.connect()
const { rows } = await client.query(
  "SELECT 1 FROM pg_database WHERE datname=$1",
  ["commerceguard_test"],
)
await client.end()
if (!rows.length) await pg.createDatabase("commerceguard_test")
console.log(
  "Real portable PostgreSQL is ready on 127.0.0.1:54329. Keep this terminal open.",
)
let stopping = false
async function stop() {
  if (!stopping) {
    stopping = true
    await pg.stop()
    process.exit(0)
  }
}
process.on("SIGINT", stop)
process.on("SIGTERM", stop)
setInterval(() => {}, 60_000)
