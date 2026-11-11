# Software Test Summary Report

**Campaign date:** 2026-11-11, Asia/Jerusalem. Evidence stores ISO timestamps in UTC.
**AUT:** Medusa DTC Starter `0a84b2ac13dbf5091a84af4b54ce0b19f6c9ad55`.
**Host:** Windows 11 Home 10.0.26200, Intel i5-1235U / 12 logical processors,
approximately 16 GiB RAM; workspace on OneDrive. Node 22.23.4, real portable PostgreSQL
18.6, Medusa 2.22.6, Next.js 16.3.8, Playwright 1.65.0, two test workers, zero retries.

## Overall outcome

Full regression executed **105 project cases** from **54 unique scenarios**:
**104 passed, 1 unexpected failure, 0 skipped, 0 flaky**, in **310.35 seconds**.
This is not a completely green regression release. The outstanding failure is
CG-B001: accepted fractional input is silently rounded to an integer. No skip or
expected-failure annotation hides it.

| Project         | Passed | Failed | Notes                                                                   |
| --------------- | -----: | -----: | ----------------------------------------------------------------------- |
| API             |     30 |      1 | Independent request contexts; API-013 is the reproduced product finding |
| Integration     |      6 |      0 | Real read-only SQL, including UI → API → DB quantity check              |
| Chromium UI     |     17 |      0 | Full browser commerce workflows                                         |
| Firefox UI      |     17 |      0 | Full browser commerce workflows                                         |
| WebKit UI       |     17 |      0 | Full browser commerce workflows                                         |
| Mobile Chromium |     17 |      0 | Pixel 7 viewport/touch emulation, not real hardware                     |

Source: [complete case outcomes](evidence/regression-results.json). A prior Chromium
and integration confirmation also passed [23/23](evidence/chromium-integration-results.json).
The final independent API confirmation was [30 pass / 1 fail](evidence/api-final-results.json)
in 10.92s, reproducing only CG-B001 after the framework refinements.

## Controlled defect effectiveness

Five independently applied local source mutations each completed **pass → assertion
failure → pass**: **10 passing checks and 5 intentionally failing checks**. The
campaign runner exited successfully after verifying restoration. These five expected
experimental failures are separate from the one unexpected product regression failure.

| Defect                            | Baseline | Injected          | Restored |
| --------------------------------- | -------- | ----------------- | -------- |
| CG-D01 wrong displayed total      | Pass     | Assertion failure | Pass     |
| CG-D02 doubled displayed discount | Pass     | Assertion failure | Pass     |
| CG-D03 double quantity on add     | Pass     | Assertion failure | Pass     |
| CG-D04 off-by-one quantity update | Pass     | Assertion failure | Pass     |
| CG-D05 suppressed login error     | Pass     | Assertion failure | Pass     |

[Measured mutation summary](evidence/defects/summary.json) includes per-phase reports,
source hashes and errors; screenshots live in each injected folder. `git diff
--exit-code` for the four distinct target files was empty after all five experiments,
and no recovery backup remained. The same total component is used by CG-D01/D02.

An earlier campaign attempt was correctly rejected because page hydration timed out
during hot reload, rather than failing a business assertion. Restarting/warming the
owned storefront between source versions made the experiments unambiguous. A hard
interruption recovery was also exercised; the backup guard refused a new campaign
until `--restore` completed.

## Smoke stability and performance

Final smoke repetition: **45/45 passed** (15 critical cases × 3 cycles), **0 retries,
0 skipped**, in **116.22 seconds**. This is the same API/integration/Chromium selection
used by the PR smoke gate. [Measured outcomes](evidence/stability-results.json).

Two earlier repeat runs each recorded **43 pass / 2 fail** and remain preserved:

- [Initial repeat](evidence/stability-initial-results.json): the first confirmation
  response spent 26.5s compiling, exceeding the 15s assertion timeout; a concurrent
  catalog page remained on its skeleton. Startup now fully reads and warms the
  checkout, confirmation, account and catalog routes before testing. The warmup is
  non-mutating and accepts the missing cart/order state of its probe URLs; real
  checkout tests still create and validate their own successful order.
- [Transport repeat](evidence/stability-transport-results.json): browser checks
  passed after warmup, but two API checkout requests encountered `ECONNRESET`.
  No backend restart appeared in the logs. Business-test request contexts now use
  `Connection: close` to avoid idle socket reuse, without any request/test retry.
  The final repeat passed; this does not prove the root cause of the transport
  resets or certify write-endpoint keep-alive stability. k6 uses normal keep-alive
  separately for its read-only workflow.

[Recorded route warmup](evidence/environment-warmup.json) documents the actual paths,
statuses and durations. These startup probes are not additional passing test cases.

Local k6 baseline and ramp metrics are recorded separately under
`evidence/performance/`; their completed values are listed below.

| Profile                                        | Load              | HTTP requests |      p95 |      p99 | HTTP / business failure rate | Thresholds |
| ---------------------------------------------- | ----------------- | ------------: | -------: | -------: | ---------------------------- | ---------- |
| [Baseline](evidence/performance/baseline.json) | 2 VUs / 20s       |           102 | 305.93ms | 333.19ms | 0% / 0%                      | All passed |
| [Ramp](evidence/performance/ramp.json)         | 1→3→5→0 VUs / 45s |           327 | 246.91ms | 261.89ms | 0% / 0%                      | All passed |

Both k6 commands exited 0, with all status/resource checks passing. Default HTTP
keep-alive remained enabled. These are two small local read-only workloads on the
four-product dataset, not a comparison proving improvement or production capacity.

## Verification and setup

Verified: strict TypeScript check; actionlint 1.7.12 on all three workflows; npm lockfile
root dependency consistency; real migrations, seed and HTTP readiness; pinned Docker
image tag/digest exists in the official registry; all five mutation source hashes
restored. Docker/Compose and hosted GitHub Actions were not executable on this host
(Docker absent; repository not published). Workflow lint is not a hosted CI pass.

The initial browser development runs exposed incorrect test assumptions/locators and
SSR timing. They were investigated using source, screenshots, DOM snapshots and traces;
the tests were corrected before the measured full matrix. A null React hydration probe
now provides explicit readiness without sleeps. The initial API run was 30 pass/1 fail
and led to the independently documented product finding; it was not counted twice as
a separate discovered defect.

Manual artifacts are designed but not manually signed off: STP, 13 STD cases,
traceability, risk register, five exploratory charters and severity/priority policy.

## Commands executed

Commands were invoked using the installed workspace-local Node 22 binary where the
host's global Node 20 would be incompatible. Representative commands (package scripts
are documented aliases of these operations):

```sh
git clone https://github.com/medusajs/dtc-starter.git .aut/dtc-starter
npm install --prefix .tools node@22.23.4 pnpm@10.11.1
npm install --no-audit --no-fund
node scripts/portable-db.mjs
node scripts/aut.mjs prepare
node scripts/aut.mjs init
node scripts/aut.mjs seed
node scripts/aut.mjs start
node scripts/aut.mjs ready
npx playwright install chromium firefox webkit
npx tsc --noEmit
npx playwright test --project=api
npx playwright test --project=integration --project=chromium
npx playwright test
node scripts/reproduce-quantity.mjs
node scripts/defects.mjs
node scripts/defects.mjs --restore
npm run test:stability
node scripts/performance.mjs
# Second performance invocation: PERF_PROFILE=ramp and a separate PERF_OUTPUT.
node scripts/capture-evidence.mjs
actionlint .github/workflows/smoke.yml .github/workflows/regression.yml .github/workflows/performance.yml
git init -b main
```

## Release recommendation and remaining gaps

Critical browser/API/order/persistence flows passed the full matrix. Keep CG-B001
open for upstream validation/persistence triage and require an explicit disposition
before claiming a fully green regression release. No repository was published,
paid service deployed or external load target exercised.

Next: run hosted Actions after publication; verify the Compose path on a Docker host;
triage quantity coercion; add distributed locking/low-stock concurrency, payment
failure/refund and multi-region tax rounding coverage; execute the exploratory/real-
device/accessibility charters. Short local k6 tests do not establish production capacity.
