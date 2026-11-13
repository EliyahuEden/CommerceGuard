# Software Test Plan

**System:** Medusa DTC Starter at the commit in `config/aut.json`, with the tracked
FORME storefront presentation overlay.
**Owner:** CommerceGuard QA. **Date:** 2026-11-11. **Environment:** local disposable
PostgreSQL, Medusa API, Next.js storefront; built-in manual payment provider.

## Objective and scope

Detect release risks that a status-only API probe or a happy-path browser test
misses: wrong money, lost quantities, duplicate orders, customer data leakage,
and UI/API/database disagreement. Original QA code resides outside the AUT.

In scope: catalog/search/category filters, variant selection, cart CRUD and stock
overflow, percentage promotions, registration/login, profile edits, customer
address ownership, checkout/order history, duplicate completion, persistence.
The redesign adds local image availability, selected-color photographs, keyboard
skip navigation, responsive menu/filter operation, and horizontal overflow checks.
Browsers: bundled Chromium, Firefox, WebKit; Pixel 7 viewport with touch emulation.

The shopping enhancement scope adds realistic catalog prices/stock/collections,
guest-to-account wishlist merging and isolation, size/zoom modal keyboard behavior,
address-error retention and mobile layout, current-price buy-again carts, account
order ownership, and axe checks on eight key shopping routes. Automated accessibility
checks supplement keyboard/visual review; real assistive-technology certification
is not claimed.

Out of scope: real settlement/refunds, paid providers, email delivery, admin UX,
multi-process distributed locking, real mobile hardware, full accessibility or
security certification. Search uses Medusa's real PostgreSQL-backed search index.

## Test levels and approach

- API: independent Playwright APIRequestContext, selected Zod contracts, explicit
  status/error checks, negative payloads, business assertions and ownership checks.
- UI: page components, existing roles/test ids, actual server actions, fresh browser
  context per test. API setup is used for prerequisites; checkout itself is exercised
  through shipping, payment selection, place order, confirmation and history UI.
- Integration: parameterized read-only SQL for test-owned IDs. Compare cart units,
  amounts, persisted adjustments, order items and order/cart links. Medusa computes
  totals; do not invent a persisted cart-total column.
- Performance: read-only catalog workflow, concurrent batch calls, baseline and
  1→3→5→0 VU ramp. Local-only checks at both wrapper and script entry points.
- Effectiveness: five individually applied source mutations, baseline/fail/restore
  cycle, no expected-failure annotations, screenshots and machine-readable results.

## Entry, exit and release criteria

Entry: pinned checkout, frozen dependency installation, healthy PostgreSQL, completed
migrations, seeded IDs and CG10 promotion, HTTP readiness and route warmup.

PR gate: typecheck and every `@smoke` check on API, Chromium and integration pass;
zero test retries; publish evidence even after failure. A failed critical check
blocks merge when this workflow is configured as a required repository check.

Regression exit: run all projects; record every unexpected failure and its impact.
All cases carry the `@regression` config tag; smoke cases also carry `@smoke`.
An open non-smoke product defect remains visible in the report and requires explicit
release triage. A green smoke run is **not** proof that regression passed.
Performance exit: all declared thresholds pass for the recorded local profile.

## Isolation, cleanup and credentials

Every mutable case creates its own cart and random `cg.<UUID>@example.test` account.
The catalog and unlimited-use CG10 promotion are shared read-only. The million-unit
stock seed makes normal purchases independent; overstock tests exceed initial
stock and never reserve it. Account history always uses a new account.

Test records remain in the dedicated database to aid diagnosis. Use a new disposable
database/Compose volume for a clean campaign; tests never delete through ad hoc SQL.
`Database` forces read-only sessions, local host and exact database name. Setup uses
core workflows; SQL is reserved for provisioning and validation outside the backend.
Only local, non-deliverable test identities and generated local secrets are used.
Reports/traces can contain these test tokens; limit artifact retention and never
reuse the environment for sensitive data.

## Diagnostics and triage

HTML, JSON and JUnit reports; screenshots, traces, videos and browser DOM context
on failure. Assertion messages include API response bodies. Backend/storefront logs
are retained under `.runtime`. Classify a failure as environment, test code, product
or seeded defect before changing assertions. Fix a wrong locator/assumption from
source and live evidence; do not soften a real business assertion to obtain green.

Use `docs/DEFECTS.md` for findings and `docs/STR.md` for measured campaign outcomes.

## Maintenance

To update Medusa, deliberately change the commit pin, inspect license/AGENTS and
lockfile changes, recheck route validators, seed and SQL adapters, and rerun the full
matrix plus mutation campaign. SQL is version coupled and isolated in one suite;
it is not claimed as a public application contract. Do not manually edit upstream
lockfiles or installed packages.
