# Measured evidence index

All results come from the real pinned local AUT on 2026-11-11. No report image or
pass/fail count is fabricated. Manual scenarios are designed, not signed off.

| Artifact | Meaning |
|---|---|
| [regression-results.json](regression-results.json) | Full 105-execution matrix: 104 pass, 1 unexpected quantity finding |
| [stability-results.json](stability-results.json) | Final 15-case smoke selection × 3: 45 pass, zero retries |
| [stability-initial-results.json](stability-initial-results.json) | Earlier 43/2 run with cold compilation/skeleton failures |
| [stability-transport-results.json](stability-transport-results.json) | Earlier 43/2 run with two ECONNRESET failures |
| [environment-warmup.json](environment-warmup.json) | Non-mutating route compilation probes, not extra tests |
| [api-final-results.json](api-final-results.json) | Final independent API confirmation: 30 pass / 1 known product finding |
| [quantity-coercion.json](quantity-coercion.json) | Actual request, response, SQL quantity and integer column type |
| [defects/summary.json](defects/summary.json) | Five complete baseline/fail/restored cycles and source hashes |
| [performance/baseline.json](performance/baseline.json) | k6 metrics: 102 requests, all budgets passed |
| [performance/ramp.json](performance/ramp.json) | k6 metrics: 327 requests, all budgets passed |
| [screenshots](screenshots/) | Real cart/promotion, catalog and full regression-report screenshots |

Earlier API and Chromium/integration confirmation reports are also retained. They
are separate runs, not additional unique scenarios or independently discovered bugs.
The rejected hot-reload mutation attempt is preserved under `defects/`; the runner
did not count it as successful detection.

JSON summary files preserve actual statuses/durations/errors; raw per-defect
Playwright reports include machine-local source/attachment paths. The five copied
failure PNGs are portable. Regenerate full trace/video/HTML with the documented test
commands; these larger runtime outputs are ignored by Git. Future defect campaigns
retain separate per-phase runtime output. Default `playwright-report/` currently
contains the full 105-case report; the smoke/API confirmation reports are in `.runtime`.
