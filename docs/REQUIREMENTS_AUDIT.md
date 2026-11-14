# CommerceGuard requirements audit

Audited against the original project brief supplied by the owner, plus the six
shopping enhancements requested after the FORME redesign. This distinguishes
implemented behavior, measured verification and the remaining product and verification limits. Evidence from earlier campaigns remains dated and separate.

| Original requirement                                                               | Implementation / evidence                                                                | Status                                                                               |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Inspect, license and pin a real open-source AUT                                    | `config/aut.json`, `docs/AUT.md`, upstream MIT notice; ignored pinned checkout           | Implemented and previously executed locally                                          |
| Separate original framework from third-party source                                | `src/`, `tests/`, `storefront/`, `aut/`; reproducible prepare script                     | Implemented                                                                          |
| TypeScript and Playwright UI/API                                                   | Shared fixtures, API clients, page objects, factories and schema checks                  | Verified locally in the 153-execution matrix                                         |
| Catalog, cart, quantities, promotions                                              | Existing critical workflows plus expanded catalog/availability cases                     | Verified locally in the 153-execution matrix                                         |
| Registration, login, invalid credentials, account and access controls              | Independent customers, token/foreign-address checks, profile and history                 | Verified locally; normal and negative identity cases passed                          |
| Checkout and order creation/history                                                | Real manual-payment checkout and local orders                                            | Verified locally across all four browser projects                                    |
| Dedicated PostgreSQL and SQL cross-layer assertions                                | Six integration scenarios, parameterized read-only assertions, dedicated DB guard        | Six integration checks passed after enhancements                                     |
| Baseline, concurrent and ramp performance with budgets                             | Separate local k6 profiles, latency/error/business thresholds                            | New 432-request campaign passed all thresholds                                       |
| STP, STD, STR, traceability, risks, exploratory charters, defect severity/priority | Professional documents under `docs/`; 19 documented manual scenarios                     | Implemented; automated enhancement IDs mapped                                        |
| 40–60 meaningful scenarios where justified                                         | 69 unique scenarios; new wishlist/accessibility/order risks justify the additional cases | 153 measured executions: 152 pass / 1 product failure; no source-coverage percentage |
| Chromium, Firefox, WebKit and mobile                                               | Four Playwright UI projects, no blanket retries                                          | All 112 UI executions passed across four projects                                    |
| Screenshots, HTML/JSON/JUnit, traces and diagnostics                               | Native enhanced HTML report and retained failure artifacts                               | Implemented                                                                          |
| At least five injected defects, each pass → fail → pass                            | Five reversible source patches, screenshots, source hashes and phase summaries           | Five current baseline/fail/restored cycles passed with source hashes verified        |
| PR environment setup/readiness/seed/smoke gate                                     | Shared GitHub action, health checks, TypeScript checks, critical smoke                   | Observed hosted push smoke: 22/22 plus keyboard audit; PR trigger configured         |
| Manual/scheduled broader regression                                                | Weekly Monday 03:15 UTC and workflow dispatch                                            | Executed: 152 pass / 1 open product finding; all browser/SQL checks passed           |
| Separate performance workflow and dependency caching                               | Manual k6 workflow; Node/npm cache                                                       | Hosted baseline passed 108 requests; dependency cache configured                     |
| No paid service or real payment prerequisite                                       | Local services; manual test payment; generated local assets                              | Implemented                                                                          |
| Docker Compose setup and cleanup                                                   | Dedicated PostgreSQL service, health check, disposable volumes                           | Verified on hosted Ubuntu runner; Docker unavailable locally                         |
| Installation, startup, seed, suites, reports and cleanup commands                  | `package.json`, README, `docs/AUT.md`                                                    | Clean hosted setup, seed, readiness and cleanup executed successfully                |
| README, diagram, coverage, attribution, actual evidence and limitations            | README and supporting docs                                                               | Measured metrics and real captures recorded; hosted evidence retained separately     |
| Three supported resume bullets and interview explanation                           | `docs/RESUME_BULLETS.md`                                                                 | Final resume evidence is updated from measured outcomes                              |
| Git and GitHub portfolio                                                           | Public EliyahuEden/CommerceGuard repository and baseline tag                             | Published publicly after source/credential-pattern review                            |

## Additional website requirements

| Enhancement         | Implementation                                                                                                                     | Required verification                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Realistic catalog   | Ten products; six new local images; varied EUR/USD prices, colors, three collections and stock levels; unavailable XL hoodie       | API-032/033; UI-026; repeated seed preserves stock                    |
| Product information | Fit/material/care, demonstration size chart, native modal image zoom                                                               | UI-023 keyboard/focus; visual review                                  |
| Mobile checkout     | Single-column fields, progress indicator, inline associated errors, controlled values retained on rejection                        | UI-024 plus existing complete checkout UI-017                         |
| Wishlist            | Guest browser persistence; authenticated customer metadata; merge after login; session separation                                  | API-034; UI-021/022                                                   |
| Order experience    | Actual order/payment/fulfillment states, honest confirmation, authenticated buy-again using current price/stock and a fresh bag    | UI-025 plus original order persistence/idempotency checks             |
| Accessibility pass  | Real form labels, labelled password toggles, error announcements, native modal focus, keyboard checks and axe checks on key routes | UI-023/024/027, visual/keyboard review; no blanket WCAG certification |

## Open finding and release decision

CG-B001 remains an independently discovered upstream bug: fractional quantity
`1.5` is accepted and stored as `2`. API-013 must continue failing while that behavior
exists. The full regression is not a green commercial release. Keep the defect
report and actual outcome visible in the portfolio; do not skip or weaken it.

The application is a demonstration with local orders, not a merchant deployment.
No gateway settlement, fulfillment dispatch, real support inbox or email delivery
is claimed. Real-device/screen-reader testing, distributed stock contention and
broader production security/performance assessment remain explicit limitations.

## GitHub publication checks

Before uploading: complete local feature/regression verification, inspect evidence,
check secrets and ignored runtime paths, verify licenses/assets, run formatting,
typechecks/build and workflow lint, then commit the reviewed source. After upload:
run hosted smoke, inspect logs/artifacts, and update this audit with observed results.
Public repository permission is explicit; no paid deployment is authorized.

## Final observed release state — 14 November

Public source and baseline tag are uploaded. Clean hosted smoke passed 22/22 plus
keyboard checkout. Hosted regression passed 152/153, with only CG-B001 failing.
Separate hosted baseline performance passed 108 requests. Reports/artifacts and
Docker teardown completed. See [the hosted manifest](evidence/enhancements/hosted-actions.json).
All original implementation/deliverable areas are present; this does not claim a
fully green merchant release, manual signoff, real-device testing or certification.
