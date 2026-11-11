# CommerceGuard — E-commerce QA Automation & Release Quality Gate

- Designed a TypeScript/Playwright framework with **54 risk-based scenarios** spanning
  UI, API and PostgreSQL validation; executed **105 checks** across Chromium, Firefox,
  WebKit and mobile Chromium emulation against a pinned, real Medusa application.
- Demonstrated **five controlled defect detections** using automated baseline →
  failure → restoration cycles, preserving failure screenshots and report evidence
  while restoring every modified application source file.
- Implemented PR smoke, scheduled cross-browser regression and separate k6 workflows
  with diagnostic artifacts; independently reproduced a silent quantity-coercion
  defect and confirmed the inconsistent units through API responses and read-only SQL.

**Technologies:** TypeScript, Playwright Test, APIRequestContext, PostgreSQL, SQL,
Docker Compose, GitHub Actions, k6, Zod, Node.js, Next.js/Medusa, Git.

## Verified achievements and claim limits

- Full local matrix: **104 passed, 1 unexpected product failure**, 0 skipped/retried.
- Unique cases: 31 API, 17 UI, 6 integration. All 68 UI executions and six integration
  executions passed in the full matrix. Execution count is not unique-case count.
- Five seeded examples: each baseline passed, injected version failed an assertion,
  restored version passed. This is not an exhaustive mutation-coverage percentage.
- One independently discovered quantity issue remains visible as a failing test.
- Thirteen substantial manual cases were designed; no manual signoff is claimed.
- Workflow files exist and were checked with actionlint. Hosted Actions execution
  awaits repository publication and must not be described as already completed.
- Stability and performance measurements are recorded in `STR.md`; do not claim a
  production throughput gain or a percentage coverage increase from this project.
- Final smoke repeat: **45/45 passed** across three cycles. Local k6 executed **429
  read-only requests** across baseline and ramp, with all thresholds passing and
  zero observed HTTP/business failures. Earlier failed repeat attempts remain in STR.

Evidence: [test summary](STR.md), [regression results](evidence/regression-results.json),
[mutation outcomes](evidence/defects/summary.json), [independent bug report](DEFECTS.md).

## Interview explanation

“I built CommerceGuard to test whether an e-commerce release preserves purchase
correctness, rather than just checking pages load. I pinned a real Medusa/Next.js
store, seeded controlled prices and a promotion, and isolated each test's cart and
customer. I compared browser actions with API responses and persisted SQL records.
To prove the checks work, I introduced five reversible storefront bugs and captured
the same tests failing and then passing after restoration. The API suite also found
that an accepted quantity of 1.5 became 2 in the database. I kept that failure visible
and documented it instead of changing the assertion to make the report green.”
