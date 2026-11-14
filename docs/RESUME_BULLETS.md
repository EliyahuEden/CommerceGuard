# CommerceGuard — E-commerce QA Automation & Release Quality Gate

- Built a TypeScript/Playwright QA framework with **69 risk-based scenarios** across
  UI, API and PostgreSQL; executed **153 checks**, including **112 passing browser
  checks** across Chromium, Firefox, WebKit and mobile Chromium emulation.
- Demonstrated **five controlled defect detections** through baseline → assertion
  failure → restored-pass cycles against a real Medusa storefront, retaining
  screenshots, traces, reports and restored-source hash evidence.
- Implemented GitHub Actions quality gates against disposable Docker/PostgreSQL;
  verified **22/22 hosted smoke checks** plus keyboard checkout, while retaining an
  independently reproduced quantity-coercion bug as a normal regression failure.

**Technologies:** TypeScript, Playwright Test, APIRequestContext, PostgreSQL, SQL,
Docker Compose, GitHub Actions, k6, axe-core, Zod, Node.js, Next.js/Medusa, Git.

## Verified achievements and claim limits

- Local production-mode matrix: **152 passed / 1 unexpected product failure**, zero
  skips, retries or flaky outcomes, in **357.81 seconds**.
- Final hosted matrix also passed **152/153**, including all 112 browser and six
  integration checks; only the documented quantity finding failed.
- Unique cases: 35 API, 28 UI, 6 integration. Four UI projects produce 112 browser
  executions. Executions are not additional unique scenarios or coverage percentages.
- Smoke stability: **66/66 passed**, 22 critical cases repeated three times, without
  retries. A separate **seven-stage keyboard-only purchase audit** passed with zero
  pointer actions and zero axe violations in delivery/payment/review states.
- Five seeded defects have baseline pass → injected assertion failure → restored
  pass evidence. They are five distinct examples across campaigns, not an exhaustive
  mutation-coverage percentage.
- The remaining product failure is CG-B001: accepted quantity 1.5 becomes 2 in API
  and SQL. A passing smoke gate does not imply a fully green commercial release.
- Nineteen substantial manual scenarios are documented; no manual signoff is claimed.
- Production compilation and QA/storefront/backend TypeScript checks passed. Targeted
  overlay lint has 0 errors / 9 React warnings that remain maintenance work.
- Local k6 executed **432 read-only requests** across baseline/ramp; all thresholds
  passed, with zero observed HTTP/business failures. Baseline p95 was 302.55ms and
  ramp p95 was 174.78ms. No capacity or performance-improvement claim is made.
- The storefront adds a varied ten-product catalog, guest/account wishlist, size
  information/zoom, retained checkout validation and ownership-checked order reuse.
  This original overlay is clearly separated from the pinned third-party application.
- Hosted smoke passed 22/22 plus keyboard checkout; a separate hosted k6 baseline
  passed 108 requests with zero HTTP/business failures. Docker setup, readiness and
  cleanup were executed on GitHub-hosted Ubuntu. Workflow YAML passed actionlint.
  See the requirements audit for the latest broader-regression outcome.

Evidence: [current verification](ENHANCEMENT_RESULTS.md),
[full regression outcomes](evidence/enhancements/regression-results.json),
[smoke stability](evidence/enhancements/stability-results.json),
[independent bug report](DEFECTS.md), [requirements audit](REQUIREMENTS_AUDIT.md).

## Interview explanation

“I built CommerceGuard to check whether an e-commerce release preserves purchase
correctness. I pinned a real Medusa/Next.js application, created a separate FORME
storefront, and seeded controlled products, prices and a promotion. Each test owns
its cart and customer. I compare browser actions with API responses and SQL records.

I proved selected checks detect faults by introducing five reversible storefront
bugs and capturing failure and restoration evidence. The API suite independently
found that accepted quantity 1.5 becomes 2 in the database; I kept that failure
visible. The enhanced matrix passed all 112 browser checks and six integration
checks, with that product finding still open. I also verify keyboard checkout,
repeat the critical smoke selection, and retain CI reports for release decisions.”

A useful engineering example for interviews: a fresh hosted run exposed a search
index that migrations had created but not activated. Later traces exposed hidden
streaming fragments in locator matches. I fixed initial index activation and active
page scoping, retained the failing evidence, and kept all money, persistence and
privacy assertions intact instead of adding blanket retries.
