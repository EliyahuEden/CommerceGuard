# CommerceGuard

**Enterprise-style QA automation and an evidence-driven release quality gate for a
real e-commerce application.** Built as an SDET portfolio: test important purchase,
money and customer-isolation rules, verify persisted data, and prove selected tests
can catch deliberately introduced defects.

CommerceGuard is the original TypeScript QA framework. The storefront/backend are
the MIT-licensed [Medusa DTC Starter](https://github.com/medusajs/dtc-starter), pinned
to [`0a84b2a`](https://github.com/medusajs/dtc-starter/tree/0a84b2ac13dbf5091a84af4b54ce0b19f6c9ad55)
and prepared into ignored `.aut/`. Its source is not vendored into this repository.

## Verified results — 11 November 2026

| Campaign        | Measured outcome                                                                              |
| --------------- | --------------------------------------------------------------------------------------------- |
| Full matrix     | **104 passed / 1 product failure**, 105 executions, zero skips/retries                        |
| Smoke stability | **45/45 passed** — 15 critical cases repeated three times                                     |
| Seeded defects  | **5/5 detected and restored**, each with pass → fail → pass evidence                          |
| Local k6        | Baseline: 102 requests, p95 305.93ms; ramp: 327 requests, p95 246.91ms; all thresholds passed |

The open finding is accepted quantity `1.5` becoming `2` in both API and SQL. It stays
visible in full regression. Earlier compilation and transport failures, their fixes,
and the final repeat are preserved in the [test summary](docs/STR.md). Docker execution
and hosted Actions remain unverified here; Docker is absent and no repository was
published.

<details>
<summary>Actual storefront and regression-report screenshots</summary>

Three EUR 10 items with CG10 produce EUR 3 discount and EUR 27 total:

![Actual Medusa cart with the controlled promotion](docs/evidence/screenshots/cart-promotion.png)

The measured report keeps the independently discovered API failure visible:

![Actual 105-case regression report](docs/evidence/screenshots/regression-report.png)

</details>

## What this project demonstrates

- 54 substantial scenarios: 31 API, 17 UI, 6 database/integration; four UI projects.
- Real product search/filtering, cart/stock boundaries, promotions, customer accounts,
  authorization, manual-payment checkout, order history and repeated completion.
- UI → API → PostgreSQL validation using parameterized read-only queries.
- Five reversible storefront defects with automated baseline/failure/restoration
  evidence; an independently discovered quantity-coercion issue is tracked separately.
- PR smoke gate, weekly/manual cross-browser regression and separate local k6 budgets.
- HTML/JSON/JUnit reporting with failure screenshots, video, traces and DOM context.
- Risk-based STP, 13 manual scenarios, traceability, exploratory charters and honest
  measured results. No blanket retries, paid services or fabricated coverage metrics.

## Architecture

```mermaid
flowchart LR
  Setup[Pin + migrate + seed] --> App[Next.js storefront / Medusa API]
  UI[Playwright UI\n3 engines + mobile] --> App
  API[Playwright API clients] --> App
  App --> DB[(PostgreSQL)]
  SQL[Read-only SQL assertions] --> DB
  Defects[Controlled source patches] --> App
  Perf[k6 baseline + ramp] --> App
  UI --> Reports[HTML / JSON / JUnit\nScreenshots + traces]
  API --> Reports
  Reports --> Gate[CI quality gate]
```

See [design decisions](docs/ARCHITECTURE.md) and [AUT inspection/setup](docs/AUT.md).

## Stack

TypeScript 7.0.2 · Playwright Test 1.65.0 / APIRequestContext · PostgreSQL 18.6 ·
Node 22.23.4 · Medusa 2.22.6 · Next.js 16.3.8 · Zod · pg · Docker Compose ·
GitHub Actions · k6 2.3.0. npm locks the QA repository; upstream uses its frozen
pnpm 10.11.1 lockfile. Playwright's enhanced native report avoids a Java dependency.

## Run locally

Prerequisites: **Node 22.23.4**, npm, Git and Docker Compose v2. Use a dedicated
workspace and keep the application on local ports 8000/9000 and PostgreSQL 54329.
No admin account, payment credential or secret service is required.

```sh
npm ci
npx playwright install --with-deps chromium firefox webkit
docker compose up -d --wait postgres
npm run aut:prepare
npm run aut:init
npm run aut:seed
npm run aut:start
npm run test:smoke
```

On Windows, `npx playwright install chromium firefox webkit` installs the browser
binaries; `--with-deps` mainly installs Linux packages. If Docker is unavailable,
run `npm run db:portable` in a separate terminal instead of `docker compose up`,
keep it open, then continue with `aut:prepare`. This starts real PostgreSQL, using
the optional packaged binary distribution; see [Windows notes](docs/AUT.md).

Defaults work without copying an environment file. `.env.example` documents every
optional override. Setup creates ignored local secrets and the public seed manifest.
The default dataset is four products, EUR 10 T-Shirt, EUR 10 standard shipping and
CG10 (10% item discount). Tests generate their own carts and `@example.test` accounts.

Open the running [storefront](http://localhost:8000/dk/store). Startup logs are in
`.runtime/backend.log` and `.runtime/storefront.log`.

| Command                    | Purpose                                                         |
| -------------------------- | --------------------------------------------------------------- |
| `npm run aut:ready`        | Poll actual API and storefront readiness                        |
| `npm run aut:seed`         | Create CG10 if absent and export actual public fixture IDs      |
| `npm run typecheck`        | Strict TypeScript checks                                        |
| `npm run test:smoke`       | Critical API + integration + Chromium release gate              |
| `npm run test:regression`  | All 105 project executions; exposes known product findings      |
| `npm run test:api`         | 31 independent API cases                                        |
| `npm run test:integration` | Six persistence/cross-layer cases                               |
| `npm run test:ui`          | 17 scenarios × Chromium, Firefox, WebKit, Pixel 7 viewport      |
| `npm run test:stability`   | Repeat every smoke check three times, without retries           |
| `npm run test:defects`     | Sequential baseline → inject → detect → restore → pass campaign |
| `npm run test:perf`        | Local read-only k6 baseline; requires k6 executable             |
| `npm run report`           | Open the latest interactive HTML report                         |
| `npm run report:summary`   | Persist compact measured results under docs/evidence            |
| `npm run aut:stop`         | Stop only application processes owned by this workspace         |

For a single test: `npx playwright test --project=chromium --grep UI-007`.
For the ramp workload and performance budgets, see [performance design](docs/PERFORMANCE.md).

Cleanup:

```sh
npm run aut:stop
docker compose down --volumes
```

The second command removes this Compose project's disposable data. With the portable
runner, stop its terminal with Ctrl+C; its data location is recorded in
`.runtime/portable-db-location.txt`. Retained test records support failure diagnosis;
use a fresh dedicated database for a fresh campaign. Never reuse it for production.

## Coverage and release decisions

| Area                                   | API                                                                                   | UI                                             | SQL integration                                        |
| -------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------ |
| Catalog, regional price, search/filter | Contract, query, paging, 404                                                          | Browse, details, options, search, category     | —                                                      |
| Cart and inventory                     | Create/update/delete, invalid/missing/overflow, repeated add                          | Add, edit, delete, 1–10 limit                  | Units, price arithmetic, no invalid write              |
| Promotions                             | Ten percent, repeated code, unknown code                                              | Apply/remove and displayed money               | Persisted adjustment                                   |
| Customer/auth/access                   | Register, duplicate, login, forged/missing token, foreign address, admin denial       | Register/login/logout, profile, anonymous gate | —                                                      |
| Orders                                 | Shipping/payment/completion, duplicate completion, incomplete checkout, owner history | Full checkout and order history                | Order lines, completed cart, exactly one/no order link |

[Traceability](docs/TRACEABILITY.md) maps test IDs to requirements, risks and manual
cases. [STP](docs/STP.md), [STD](docs/STD.md), [risk strategy](docs/RISKS.md),
[exploratory charters](docs/EXPLORATORY.md), and
[severity/priority definitions](docs/SEVERITY_PRIORITY.md) describe the QA process.

The smoke gate passes only when every selected critical test passes. Full regression
also includes the visible `@product-bug` quantity check; it is not skipped, retried or
marked as expected failure. An open product defect is a release-triage input.

## CI/CD

`.github/workflows/smoke.yml` runs on pull requests and manually. The shared action
installs Node/dependencies/browsers, starts Compose PostgreSQL with health checks,
prepares the pinned AUT, migrates/seeds, and polls HTTP readiness. It typechecks and
runs smoke tests. Test failure exits nonzero; HTML/JSON/JUnit, traces and logs are
uploaded even after failure. Configure **PR release quality gate / smoke** as a
required check in repository branch protection.

`regression.yml` runs manually and Mondays at 03:15 UTC across all browser projects.
`performance.yml` runs manually with baseline/ramp choice. Both retain results and
tear down the disposable environment. npm dependency caching is configured.
Hosted Actions execution is pending publication of this local repository; a local
smoke run must not be represented as a completed hosted workflow.

## Defects and evidence

| Seeded defect | Detecting case | Intended failure                                  |
| ------------- | -------------- | ------------------------------------------------- |
| CG-D01        | UI-004         | Customer sees cart total EUR 31 instead of EUR 30 |
| CG-D02        | UI-007         | Customer sees EUR 6 discount instead of EUR 3     |
| CG-D03        | UI-003         | One add action submits two units                  |
| CG-D04        | UI-004         | Quantity 3 submits quantity 4                     |
| CG-D05        | UI-013         | Invalid credentials produce no visible error      |

The [patch manifest](defects/scenarios.json) edits actual storefront source, one
change at a time. The runner requires a passing baseline, one assertion failure,
restores the original bytes in `finally`, and requires the detecting case to pass.
An interrupted hard kill can be recovered using `node scripts/defects.mjs --restore`.
No mutation is a mock server or an always-failing demonstration assertion.

See [defect reports](docs/DEFECTS.md), [test summary](docs/STR.md) and
[resume/interview notes](docs/RESUME_BULLETS.md). Evidence links and measured campaign
counts are recorded in the summary after execution.

## Structure

```text
aut/                   Original Medusa seed and null hydration probe
config/aut.json        Upstream commit/toolchain pin
src/api/               Real HTTP client, contracts, checkout/auth helpers
src/data/              Unique test-data factories
src/db/                Restricted read-only PostgreSQL utility
src/fixtures/          Per-test request and database lifetimes
src/pages/             Encapsulated browser interactions
tests/api/             Independent contract/business/authorization tests
tests/ui/              Browser commerce workflows
tests/integration/     UI/API/SQL persistence checks
performance/           Local k6 workload and thresholds
defects/               Five controlled source patch definitions
scripts/               AUT lifecycle, portable DB, mutation/evidence runners
.github/               Shared setup and three quality-gate workflows
docs/                  QA artifacts, decisions, measured evidence and resume bullets
.aut/ .runtime/        Ignored third-party checkout and disposable local state
```

## Limitations and next improvements

The small seeded dataset and local in-memory event/lock/cache adapters do not prove
distributed behavior or production performance. Mobile is viewport emulation. Real
gateway settlement/refunds, email delivery, multi-region tax rounding, concurrent
order completion races, low-stock contention and comprehensive accessibility remain
future work. SQL assertions intentionally couple to the pinned schema. Demo image
availability is outside these commerce checks.

Next: triage/fix the quantity-coercion finding upstream, run hosted CI after publishing,
add Redis-backed concurrency/low-stock scenarios, test tax rounding across currencies,
and extend keyboard/accessibility coverage. Add coverage where it protects a stated
risk, rather than increasing counts without additional evidence.
