# Application under test and reproducibility

Upstream: [Medusa DTC Starter](https://github.com/medusajs/dtc-starter), MIT,
copyright Medusa. Pinned commit:
[`0a84b2ac13dbf5091a84af4b54ce0b19f6c9ad55`](https://github.com/medusajs/dtc-starter/tree/0a84b2ac13dbf5091a84af4b54ce0b19f6c9ad55).
Its source, history, MIT license, AGENTS.md, manifests, lockfile, seed, storefront
components and installed package instructions were inspected before API/seed work.
The original license remains in the cloned checkout; CommerceGuard has its own MIT
license. The FORME presentation layer is an original redesign with adapted upstream
components attributed separately; see [storefront design](STOREFRONT.md). The complete
upstream application remains an ignored clone.

## Runtime

Node 22.23.4; upstream declares pnpm 10.11.1 in its `packageManager` value;
Medusa 2.22.6; Next.js 16.3.8; PostgreSQL 18.6. Upstream packages install with its
frozen lockfile. Root QA dependencies use npm and the independent package-lock.json.
The QA scripts execute reviewed pnpm 10.34.9 against that same frozen upstream
lockfile. Version auto-download is disabled so the upstream declaration cannot
silently select the older executable. This compatible pnpm 10 patch removes the
high-severity advisories reported for the previous QA tool dependency; the npm
audit after the upgrade reported zero vulnerabilities. npm itself is never used
to install the upstream application. No upstream lockfile is hand-edited.

`aut:prepare` clones/checks out the pinned revision in ignored `.aut/dtc-starter`,
installs dependencies, disables the unrelated admin dashboard, copies the seed, and
applies the tracked FORME overlay and a tiny hydration-readiness component to the root layout. That React effect
sets `data-commerceguard-hydrated` after the client app commits. Tests wait for this
hook before acting on SSR controls. The cart quantity control additionally stays
disabled until its own client mount, preventing lost changes at that boundary. The root hook
returns null and changes no commerce state, HTTP response or visible content.
This is explicit test instrumentation; the framework does not mock backend calls.
The source is `aut/readiness.tsx`, and setup applies it repeatably.

`aut:init` writes ignored local environment configuration with fresh JWT/cookie
secrets when absent, then runs `medusa db:migrate --execute-safe-links
--execute-safe-search --json`. The CLI's non-interactive log mode avoids a Windows
pipe/console issue observed during setup. It only targets local `commerceguard_test`. Migrations create
real module/link/search tables. The starter's one-time initial migration creates:

- Europe/EUR, Denmark and six other countries; `pp_system_default` manual payment.
- A publishable key bound to the default sales channel and stock location.
- Four published products, including Medusa T-Shirt with size/color variants.
- EUR 10 per T-Shirt variant, 1,000,000 stock units per inventory item.
- Standard and Express shipping at EUR 10; system tax provider with no seeded rate.

`aut:seed` uses `query.graph` to find the actual records and the core
`createPromotionsWorkflow` to create CG10 once. It exports only public IDs/key and
expected fixture values to `.runtime/seed.json`, and writes storefront `.env.local`.
Repeat seeding preserves the same promotion. Checkout and stock assertions validate
the seed against real responses rather than trusting setup blindly.

The same script applies `storefront/catalog.json` presentation metadata through
`updateProductsWorkflow`, and variant photographs through
`batchVariantImagesWorkflow`. Products retain their real handles, SKUs, prices,
inventory and options. The T-Shirt is presented as Essential T-Shirt, with locally
hosted black/white images. Tests read its title from the exported seed manifest.

## API source of truth

Routes were verified in the installed 2.22.6 `@medusajs/medusa/dist/api` and the
starter's server-action files, alongside [Store API documentation](https://docs.medusajs.com/api/store).
The Store key is sent as `x-publishable-api-key`. Customer bearer JWTs are created
using the real emailpass provider; no admin token or real email service is needed.

| Resource      | Actual routes used                                                                        |
| ------------- | ----------------------------------------------------------------------------------------- |
| Catalog       | `GET /store/products`, `/store/products/:id`, `/store/regions`                            |
| Cart          | `POST /store/carts`, `GET/POST /store/carts/:id`                                          |
| Items         | `POST /store/carts/:id/line-items`, `POST/DELETE .../line-items/:line_id`                 |
| Promotion     | `POST /store/carts/:id/promotions`                                                        |
| Delivery      | `GET /store/shipping-options?cart_id=...`, `POST /store/carts/:id/shipping-methods`       |
| Payment       | `POST /store/payment-collections`, `POST /store/payment-collections/:id/payment-sessions` |
| Completion    | `POST /store/carts/:id/complete`                                                          |
| Auth          | `POST /auth/customer/emailpass/register`, `POST /auth/customer/emailpass`                 |
| Customer      | `POST /store/customers`, `GET/POST /store/customers/me`                                   |
| Address       | `POST /store/customers/me/addresses`, `DELETE .../addresses/:address_id`                  |
| History       | `GET /store/orders`                                                                       |
| Access denial | `GET /admin/products` with a customer JWT                                                 |

The storefront uses its own real `/store/search` integration for search/refinements;
it is not a fabricated search box or a stubbed product list. Order history requires
an authenticated cart customer, not merely setting its email.

## Local differences and limits

The default starter uses local event bus, locking and cache adapters. Its warning
about production use is expected for this single-process test environment; these
tests do not establish Redis-backed or distributed behavior. No Stripe/Adyen setup
is required. Admin UI remains disabled to reduce startup/build costs.

On this Windows host, Docker is absent, so the measured run uses real PostgreSQL
binaries from the optional `embedded-postgres` distribution (the wrapper has a beta
version; PostgreSQL itself reports stable 18.6). Windows initialization cannot safely
use the non-ASCII workspace path. `db:portable` copies the packaged binaries with
license files intact to a workspace-hashed Local AppData folder and writes its path
to `.runtime/portable-db-location.txt`. No system service or registry is changed.
Linux/macOS can use the wrapper; Docker Compose is the recommended documented path.

## Updating or troubleshooting

Read `.runtime/backend.log` and `.runtime/storefront.log`. Confirm Node version before
running commands. A first Next route compilation can be slow; `aut:start` warms
all critical routes, including checkout and confirmation, and drains their streamed
HTML. Business API contexts request `Connection: close`; k6 keeps its normal
connection behavior. Earlier compilation/transport failures remain in `STR.md`.

On this OneDrive host a cold Medusa start exceeded 180s. Startup now allows 300s
and can resume an owned backend-only partial start by rerunning `aut:start`.
It refuses to duplicate a running backend/storefront pair. Prefer a local,
non-synced workspace for cold builds and long test campaigns.
FORME imagery and fonts are local assets. UI-018 checks homepage product image
availability; UI-020 checks selected-color image associations. This does not certify
every image or a full accessibility audit.

If an experiment is interrupted, run `node scripts/defects.mjs --restore` before
rerunning tests. If services already exist, use `aut:stop` before `aut:start`.
An occupied port is not authorization to kill another developer's process.

To upgrade: change the commit pin; inspect upstream AGENTS/package versions; reinstall
with its lockfile; inspect API validators, migrations and selectors; rerun migration,
seed, all projects, smoke repetitions and the five mutation experiments. The patch
runner requires unique source anchors and refuses mismatches.

## Enhanced catalog and production QA mode

`aut/catalog.ts` adds six products through public Medusa workflows, bringing the
catalog to ten. New products have varied EUR/USD prices, three collections, and
explicit low/zero-stock variants. Existing levels are never reset by repeat seed.
The original EUR10 fixture is retained for independent money assertions.

Use `npm run aut:start:production` for release checks; `npm run aut:start` supports
local development. Production startup compiles the storefront before readiness.
The generated local environment enables HTTP test cookies only with explicit
`COMMERCEGUARD_LOCAL_TEST=true` and exact loopback storefront/backend origins.
This exception does not apply to other production configurations.

For this measured Windows campaign the ignored `.aut/dtc-starter` checkout was
moved to a workspace-hashed Local AppData cache and linked with a junction to avoid
OneDrive build overhead. The upstream commit is unchanged. A fresh checkout outside
OneDrive is recommended; this relocation is not required by the normal setup.

Fresh databases require more than physical search migrations. `medusa exec` runs
in server mode and does not perform the worker's first index seed. Before changing
catalog products, our seed inspects the public `listIndexes()` status and calls
`reindex({ index: "product" })` for a pending index. Existing ready indexes retain
the per-product awaited ingestion path. This fixes the first clean hosted run's
initialization failure without weakening the catalog consistency check.
See [Medusa's search lifecycle](https://docs.medusajs.com/resources/infrastructure-modules/search/reindexing).
