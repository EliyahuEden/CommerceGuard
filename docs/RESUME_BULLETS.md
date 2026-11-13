# CommerceGuard — E-commerce QA Automation & Release Quality Gate

- Built a TypeScript/Playwright QA framework with **69 risk-based scenarios** across
  UI, API and PostgreSQL; executed **153 checks**, including **112 passing browser
  checks** across Chromium, Firefox, WebKit and mobile Chromium emulation.
- Demonstrated **five controlled defect detections** through baseline → assertion
  failure → restored-pass cycles against a real Medusa storefront, retaining
  screenshots, traces, reports and restored-source hash evidence.
- Implemented PR smoke, scheduled cross-browser and separate k6 quality gates;
  measured **66/66 smoke checks** over three cycles and reproduced a real quantity
  coercion bug through API and SQL while keeping it visible in regression.

**Technologies:** TypeScript, Playwright Test, APIRequestContext, PostgreSQL, SQL,
Docker Compose, GitHub Actions, k6, axe-core, Zod, Node.js, Next.js/Medusa, Git.

## Verified achievements and claim limits

- Local production-mode matrix: **152 passed / 1 unexpected product failure**, zero
  skips, retries or flaky outcomes, in **357.81 seconds**.
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
- Workflow YAML passed actionlint. Hosted CI claims require observed run evidence;
  the requirements audit records their publication/verification state.

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
