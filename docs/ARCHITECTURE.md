# Architecture and decisions

```mermaid
flowchart LR
  Dev[Developer / GitHub Actions] --> Setup[Prepare pinned AUT\nMigrate + seed + health checks]
  Setup --> AUT[Real Next.js storefront + Medusa API]
  UI[Playwright page objects\nChromium / Firefox / WebKit / Mobile] --> AUT
  API[Independent APIRequestContext\nContracts + business rules] --> AUT
  AUT --> PG[(PostgreSQL test database)]
  SQL[Read-only parameterized SQL\nTest-owned record IDs] --> PG
  UI --> Report[HTML / JSON / JUnit\nFailure screenshot + trace + video]
  API --> Report
  SQL --> Report
  K6[k6 baseline / ramp\nLocal read-only catalog] --> AUT
  Mutations[Five reversible source patches\nBaseline → fail → restore → pass] --> AUT
  Report --> Gate[Release decision with evidence]
```

| Decision                                                     | Reason and tradeoff                                                                                        |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Standalone QA repository and ignored pinned clone            | Original work is reviewable; setup needs network for initial clone/install                                 |
| Playwright for browser and API, independent request context  | One assertion/report stack; API tests have no browser prerequisite                                         |
| Native HTML report + JSON/JUnit instead of Allure            | Traces, steps and attachments without Java/report-server dependencies                                      |
| No automatic retries                                         | A real failure blocks the relevant gate; stability is measured via explicit repeat runs                    |
| Unique accounts/carts                                        | Parallel isolation without shared auth state; records accumulate in disposable DB                          |
| Read-only PostgreSQL adapter and SQL in integration suite    | Checks persistence without modifying product data behind Medusa's workflows; queries tied to pinned schema |
| Existing semantic roles/test IDs plus a null hydration probe | Avoid pre-hydration lost events; explicit small AUT instrumentation maintained under `aut/`                |
| Default local event/cache/lock adapters                      | Reproduce starter without Redis; cannot claim distributed lock/race coverage                               |
| Manual payment provider                                      | Exercises actual payment-session/order workflows without charges; does not certify gateway behavior        |
| Five source mutations in storefront                          | Measures detection against real UI/API behavior; these are examples, not an exhaustive mutation score      |
| Separate k6 job                                              | No load interference with correctness suites; small local dataset limits capacity conclusions              |

`src/config.ts` validates local endpoints; `src/api` owns HTTP helpers and contracts;
`src/data` owns per-test factories; `src/pages` encapsulates interactions; `src/fixtures`
owns request/database lifetimes; `tests/{api,ui,integration}` expresses business
expectations; `performance` owns k6 workloads; `scripts` owns lifecycle/evidence;
`aut` contains the original seed/instrumentation copied into the ignored application.

There is no mock commerce service, in-memory fake database or intercepted successful
checkout response. API setup creates real prerequisites. Browser tests still perform
the user action being asserted. SQL checks use the actual tables inspected in the
pinned package models/migrations: `cart`, `cart_line_item`,
`cart_line_item_adjustment`, `order_item`, `order_line_item`, `order_cart`.
