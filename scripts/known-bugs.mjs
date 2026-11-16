// Tracks open product bugs separately from the release gate.
//
// `npm run test:gate` excludes tests tagged @product-bug so a new regression turns the
// pipeline red. This script runs ONLY the tagged tests and requires each registered bug
// to keep failing. A tracked bug that starts passing is reported as a failure too, so the
// tag, the register entry and the defect report are removed when the product is fixed.
//
//   node scripts/known-bugs.mjs                  run the tagged tests, then evaluate
//   node scripts/known-bugs.mjs --from <report>  evaluate an existing Playwright JSON report
import { spawn } from "node:child_process"
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../", import.meta.url))

const register = JSON.parse(
  readFileSync(resolve(root, "defects/known-bugs.json"), "utf8"),
)

function collectSpecs(suites, found = []) {
  for (const suite of suites ?? []) {
    for (const spec of suite.specs ?? []) found.push(spec)
    collectSpecs(suite.suites, found)
  }
  return found
}

export function evaluate(report, bugs = register) {
  const specs = collectSpecs(report.suites)
  return bugs.map((bug) => {
    const matches = specs.filter((spec) => spec.title.includes(bug.testId))
    if (matches.length === 0) return { bug, state: "missing" }
    const stillFailing = matches.every((spec) => spec.ok === false)
    return { bug, state: stillFailing ? "reproduces" : "fixed" }
  })
}

async function runTaggedTests(reportPath) {
  mkdirSync(dirname(reportPath), { recursive: true })
  await new Promise((resolveRun) => {
    // The exit code is deliberately ignored: these tests are expected to fail.
    const child = spawn(
      process.execPath,
      [
        resolve(root, "node_modules/@playwright/test/cli.js"),
        "test",
        "--grep",
        "@product-bug",
        "--reporter=json",
      ],
      {
        cwd: root,
        stdio: ["ignore", "inherit", "inherit"],
        env: {
          ...process.env,
          PLAYWRIGHT_JSON_OUTPUT_FILE: reportPath,
          CG_OUTPUT_DIR: "test-results/known-bugs-artifacts",
        },
      },
    )
    child.on("exit", resolveRun)
  })
}

const MESSAGE = {
  reproduces: "STILL REPRODUCES (tracked, release gate unaffected)",
  fixed:
    "NOW PASSES: remove the @product-bug tag, register entry and open defect",
  missing: "TEST NOT FOUND: the register and the test suite have drifted apart",
}

const fromIndex = process.argv.indexOf("--from")
const reportPath =
  fromIndex > -1
    ? resolve(process.argv[fromIndex + 1])
    : resolve(root, "test-results/known-bugs.json")
if (fromIndex === -1) await runTaggedTests(reportPath)
if (!existsSync(reportPath)) {
  console.error(`No Playwright report found at ${reportPath}`)
  process.exit(1)
}

const results = evaluate(JSON.parse(readFileSync(reportPath, "utf8")))
const lines = results.map(
  ({ bug, state }) =>
    `${bug.id} [${bug.severity}] ${bug.testId}: ${bug.summary}\n    -> ${MESSAGE[state]}`,
)
console.log(`\nKnown product bugs\n${lines.join("\n")}`)
if (process.env.GITHUB_STEP_SUMMARY) {
  const table = [
    "### Known product bugs",
    "| Bug | Severity | Test | Status |",
    "| --- | --- | --- | --- |",
    ...results.map(
      ({ bug, state }) =>
        `| ${bug.id} | ${bug.severity} | ${bug.testId} | ${MESSAGE[state]} |`,
    ),
  ]
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, table.join("\n") + "\n")
}
process.exit(results.every((r) => r.state === "reproduces") ? 0 : 1)
