import { spawn } from "node:child_process"
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  unlinkSync,
} from "node:fs"
import { resolve, basename, relative } from "node:path"
import { createHash } from "node:crypto"
import { aut, root, runtime, waitFor, run } from "./lib.mjs"

const scenarios = JSON.parse(
  readFileSync(resolve(root, "defects/scenarios.json"), "utf8"),
)
const evidence = resolve(
  root,
  process.env.CG_DEFECT_EVIDENCE_DIR || "docs/evidence/defects",
)
mkdirSync(evidence, { recursive: true })
const recoveryPath = resolve(runtime, "defect-recovery.json")
if (process.argv.includes("--restore")) {
  if (existsSync(recoveryPath)) {
    const recovery = JSON.parse(readFileSync(recoveryPath, "utf8"))
    const target = resolve(aut, recovery.file)
    if (
      !target.startsWith(
        resolve(aut) + (process.platform === "win32" ? "\\" : "/"),
      )
    )
      throw new Error("Invalid recovery target")
    writeFileSync(target, recovery.original)
    unlinkSync(recoveryPath)
    console.log("Restored interrupted defect experiment.")
  }
  process.exit(0)
}
if (existsSync(recoveryPath))
  throw new Error(
    "An interrupted experiment exists. Run node scripts/defects.mjs --restore first.",
  )
function restoreOnSignal() {
  if (existsSync(recoveryPath)) {
    const recovery = JSON.parse(readFileSync(recoveryPath, "utf8"))
    writeFileSync(resolve(aut, recovery.file), recovery.original)
    unlinkSync(recoveryPath)
  }
  process.exit(130)
}
process.on("SIGINT", restoreOnSignal)
process.on("SIGTERM", restoreOnSignal)
await waitFor("http://127.0.0.1:9000/health")
const restart = () =>
  run(
    process.execPath,
    [resolve(root, "scripts/aut.mjs"), "restart-storefront"],
    {
      env: {
        ...process.env,
        CG_STOREFRONT_MODE: "development",
        CG_WARM_PATHS: JSON.stringify([
          "/dk/cart",
          `/dk/products/${JSON.parse(readFileSync(resolve(runtime, "seed.json"), "utf8")).handle}`,
          "/dk/account",
        ]),
      },
    },
  )
await restart()
async function execute(scenario, phase) {
  const folder = resolve(evidence, scenario.id, phase)
  mkdirSync(folder, { recursive: true })
  const report = resolve(folder, "results.json")
  const exitCode = await new Promise((done, reject) => {
    const child = spawn(
      process.execPath,
      [
        resolve(root, "node_modules/@playwright/test/cli.js"),
        "test",
        "--project=chromium",
        "--workers=1",
        "--grep",
        scenario.test,
      ],
      {
        cwd: root,
        windowsHide: true,
        stdio: "inherit",
        env: {
          ...process.env,
          CG_JSON_REPORT: report,
          CG_HTML_DIR: resolve(runtime, "defects", scenario.id, phase, "html"),
          CG_OUTPUT_DIR: resolve(
            runtime,
            "defects",
            scenario.id,
            phase,
            "artifacts",
          ),
          CG_JUNIT_REPORT: resolve(
            runtime,
            "defects",
            scenario.id,
            phase,
            "junit.xml",
          ),
        },
      },
    )
    child.on("error", reject)
    child.on("exit", done)
  })
  const result = JSON.parse(readFileSync(report, "utf8"))
  const tests = []
  function collect(suites) {
    for (const suite of suites || []) {
      for (const spec of suite.specs || []) tests.push(...spec.tests)
      collect(suite.suites)
    }
  }
  collect(result.suites)
  if (tests.length !== 1)
    throw new Error(`Expected one detecting test, found ${tests.length}`)
  const outcome = tests[0].results.at(-1)
  // Copy durable visual evidence; per-phase runtime output preserves future traces.
  for (const attachment of outcome.attachments || []) {
    if (attachment.path && attachment.contentType === "image/png")
      copyFileSync(attachment.path, resolve(folder, basename(attachment.path)))
  }
  return {
    exitCode,
    stats: result.stats,
    status: outcome.status,
    errors: outcome.errors,
    report: relative(root, report).replaceAll("\\", "/"),
  }
}
const summary = []
for (const scenario of scenarios) {
  const target = resolve(aut, scenario.file)
  const original = readFileSync(target, "utf8")
  const newline = original.includes("\r\n") ? "\r\n" : "\n"
  const find = scenario.find.replace(/\n/g, newline)
  const replacement = scenario.replace.replace(/\n/g, newline)
  if (original.split(find).length !== 2)
    throw new Error(`${scenario.id}: patch anchor must match exactly once`)
  const before = await execute(scenario, "baseline")
  if (before.exitCode !== 0 || before.status !== "passed")
    throw new Error(
      `${scenario.id}: baseline failed; mutation is not meaningful`,
    )
  let failure
  writeFileSync(recoveryPath, JSON.stringify({ file: scenario.file, original }))
  try {
    writeFileSync(target, original.replace(find, replacement))
    await restart()
    failure = await execute(scenario, "injected")
    if (
      failure.exitCode === 0 ||
      failure.stats.unexpected !== 1 ||
      failure.status !== "failed" ||
      !failure.errors.some((error) => /expect\(/.test(error.message || ""))
    ) {
      throw new Error(
        `${scenario.id}: mutation was not detected by an assertion`,
      )
    }
  } finally {
    writeFileSync(target, original)
    unlinkSync(recoveryPath)
    await restart()
  }
  const fixed = await execute(scenario, "restored")
  if (fixed.exitCode !== 0 || fixed.status !== "passed")
    throw new Error(`${scenario.id}: restored test failed`)
  summary.push({
    ...scenario,
    measuredAt: new Date().toISOString(),
    originalSha256: createHash("sha256").update(original).digest("hex"),
    baseline: before,
    injected: failure,
    restored: fixed,
  })
  writeFileSync(
    resolve(evidence, "summary.json"),
    JSON.stringify(summary, null, 2),
  )
}
console.log(`${summary.length} real source mutations detected and restored.`)
