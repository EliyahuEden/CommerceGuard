import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
const path = process.argv[2] || "test-results/results.json"
const report = JSON.parse(readFileSync(path, "utf8"))
const cases = []
function walk(suites) {
  for (const suite of suites || []) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests)
        cases.push({
          title: spec.title,
          project: test.projectName,
          status: test.status,
          results: test.results.map((result) => ({
            status: result.status,
            duration: result.duration,
            errors: result.errors,
          })),
        })
    }
    walk(suite.suites)
  }
}
walk(report.suites)
const summary = {
  measuredAt: new Date().toISOString(),
  source: path,
  stats: report.stats,
  cases,
}
mkdirSync("docs/evidence", { recursive: true })
const output = process.argv[3] || "docs/evidence/latest-results.json"
writeFileSync(output, JSON.stringify(summary, null, 2))
console.log(JSON.stringify(report.stats, null, 2))
