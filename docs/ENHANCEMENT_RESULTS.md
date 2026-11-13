# FORME shopping enhancements — verification record

Campaign: 12–13 November 2026, Asia/Jerusalem. ISO evidence timestamps are UTC.
The real Medusa commit remains `0a84b2ac13dbf5091a84af4b54ce0b19f6c9ad55`.
The earlier [redesign campaign](REDESIGN_RESULTS.md) and [original QA baseline](STR.md)
remain separate; their measurements are not relabelled as new results.

## Delivered behavior

- Ten real products, varied EUR/USD prices and stock, three collections, six new
  local product photographs, a scarce-stock knit and an unavailable hoodie size.
- Fit/material/care, a fictional demonstration body-measurement guide and modal
  image zoom with keyboard dismissal and focus restoration.
- Single-column mobile addresses, visible progress, labelled inline errors and
  retained input after failed validation; real cart persistence after correction.
- Guest wishlist persistence, authenticated account storage, merge after login,
  independent-session retrieval and session-scoped private/no-store reads.
- Actual order/payment/fulfillment statuses, guarded account order details and
  owner-only buy again using current prices/stock in a fresh real cart.
- Contrast/labels/target-size fixes, proper radio semantics, keyboard focus and
  announcements, axe route checks and a keyboard-only purchase audit.

See [implementation and tradeoffs](SHOPPING_ENHANCEMENTS.md),
[requirements audit](REQUIREMENTS_AUDIT.md), [traceability](TRACEABILITY.md) and
[asset provenance](../storefront/ASSET_PROVENANCE.md).

The suite defines **69 unique scenarios**: 35 API, 6 integration and 28 UI.
Four UI projects produce **153 project executions**, including 112 browser cases.
This exceeds the original 40–60 goal because wishlist, ownership, checkout and
accessibility introduced distinct risks. Repeated browser executions, axe routes,
keyboard audit stages and mutation phases are not counted as additional unique cases.

## Final measured results

The final full matrix completed in **357.81 seconds**: **152 passed / 1 unexpected
product failure / 0 skipped / 0 flaky**, with zero retries.

| Project              | Passed | Failed |
| -------------------- | -----: | -----: |
| API                  |     34 |      1 |
| Database integration |      6 |      0 |
| Chromium UI          |     28 |      0 |
| Firefox UI           |     28 |      0 |
| WebKit UI            |     28 |      0 |
| Mobile Chromium UI   |     28 |      0 |

[Final case outcomes](evidence/enhancements/regression-results.json).
Only API-013 / CG-B001 failed. All 112 browser checks and six integration checks
passed. This is a local production-mode application run, not hosted CI evidence.

The critical smoke selection passed **66/66** (22 cases × 3), with zero retries,
skips or flaky outcomes, in **99.49 seconds**.
[Smoke stability outcomes](evidence/enhancements/stability-results.json).

[Production compilation](evidence/enhancements/production-build.json) and all three
QA/storefront/backend TypeScript checks passed. Targeted overlay lint completed
with **0 errors / 9 warnings** in adapted React components; these warnings remain
maintenance work, not suppressed rules. [Lint output](evidence/enhancements/lint.txt).
All three workflows passed actionlint. The QA toolchain npm audit reported zero
vulnerabilities after updating pnpm to 10.34.9; this is not an upstream dependency
or application security certification.

The separate keyboard-only Chromium journey passed all **seven stages**, with
**zero pointer actions**. Delivery, payment and review axe scans each reported zero
violations. This audit is separate from the 153 Playwright executions.
[Keyboard outcomes](evidence/enhancements/keyboard/results.json).

A repeated seed left all ten products, image associations, prices, stock levels
and the public fixture manifest unchanged.
[Idempotency projection](evidence/enhancements/seed-idempotency.json).

| Local k6 profile        | Requests |       p95 |       p99 | HTTP/business failures |
| ----------------------- | -------: | --------: | --------: | ---------------------: |
| Baseline, 2 VUs / 20s   |      102 | 302.55 ms | 312.54 ms |                  0 / 0 |
| Ramp, up to 5 VUs / 45s |      330 | 174.78 ms | 228.37 ms |                  0 / 0 |

All thresholds passed, across **432 requests**. These runs used the same local
Windows/PostgreSQL environment after the correctness suites, with no competing
load campaign. The requests fetch a four-product page from the ten-product catalog,
a detail and regions concurrently. Different workload samples are not a measured
performance improvement. [Baseline metrics](evidence/enhancements/performance-baseline.json),
[ramp metrics](evidence/enhancements/performance-ramp.json).

All **five current controlled defects** completed baseline pass → injected assertion
failure → restored pass: ten passing phase checks and five intentional failing
phase checks. Each failure matched the intended problem (31 vs 30 total, doubled
discount, two vs one added units, four vs three selected units, missing login error).
Every original source hash was restored and no recovery record remained.
[Phase outcomes](evidence/enhancements/defects/summary.json),
[restoration hashes](evidence/enhancements/defect-restoration.json).
These are five distinct seeded defects, not fifteen separate discoveries.

Collection navigation received a final presentation pass: shared collection links
on catalog/footer and a consistent editorial collection template. After that change,
**9/9 focused checks passed** across the API and four browser projects. The axe case
now includes the collection page: eight routes per browser project. This focused
campaign is separate from the 153-execution matrix; it does not add unique cases.
[Follow-up outcomes](evidence/enhancements/post-navigation-results.json),
[final build](evidence/enhancements/production-build-final.json).

The real quantity finding was reproduced again through API and read-only SQL:
[13 November reproduction](evidence/enhancements/quantity-coercion.json).

Final visual capture reviewed **27 route/viewport combinations**: nine routes at
1440px, 393px and 320px. All had zero broken images, horizontal overflow, page
errors and console errors. Six supplementary captures show size-guide/zoom dialogs.
All three collection footer links were followed and their product counts compared
with actual API collection membership. Four branding asset endpoints returned 200.
[Visual diagnostics](evidence/enhancements/screenshots/diagnostics.json),
[collection](evidence/enhancements/screenshots/collection-1440.png),
[320px catalog](evidence/enhancements/screenshots/catalog-320.png),
[size guide](evidence/enhancements/screenshots/size-guide-320.png),
[native full regression report](evidence/enhancements/screenshots/regression-report.png).

## Failures and engineering corrections

The first new-feature selection had 4 passes / 6 failures; subsequent focused runs
had 8/2 and 1/1. A 35-execution cross-browser selection had 30/5. These preliminary
results are retained under `evidence/enhancements/`; they are not final suite totals.

Corrections included accessible naming/contrast, wishlist merge acknowledgement,
and explicitly requesting the order customer field before ownership checks.
The corrected ownership/accessibility selection passed 6/6. A production-focused
selection passed 11/11, covering the private wishlist read and representative
login, checkout, wishlist merge and order behavior on Chromium and WebKit.

The first complete enhancement run had **151 passes / 2 failures**: the existing
quantity finding and UI-019 mobile overflow. The menu panel combined full width
with outer margins, briefly expanding the mobile layout viewport. It now reserves
those margins. Eight consecutive focused mobile navigation checks passed after the
corrected overlay was applied. An earlier focused rerun still used the old prepared
source; build now reapplies tracked overlays to prevent this setup mistake.

Development-mode full attempts were interrupted during investigation of slow
compilation and navigation. They are not represented as completed campaigns.
Release gates now compile and run the actual Next.js production server. Session
reads use ordinary same-origin GET requests rather than the serialized Server
Action queue, while authenticated writes remain Server Actions. This avoids stale
navigation effects and permits aborting obsolete reads.

The keyboard audit was also refined to use actual roving-radio arrow navigation,
explicit navigation waits and an independent browser context for axe. Those helper
corrections are distinguished from product fixes: nested radio buttons with an
always-true checked state were a real markup defect and were corrected.

## Limits and release decision

CG-B001 / API-013 remains a real upstream finding: accepted quantity `1.5` becomes
`2`. It is a normal failing assertion, with zero retries and no skip or expected-
failure annotation. A passing smoke gate does not mean full regression is green.

The local host uses real PostgreSQL 18.6 and a pinned application checkout outside
OneDrive, linked through ignored `.aut/`. Docker is absent locally; hosted execution
must supply evidence for the Compose path. Local build/typecheck evidence is not
hosted CI evidence.

Nineteen substantial manual scenarios are documented, not signed off. Mobile is
viewport emulation; axe and keyboard checks are not real screen-reader testing or
WCAG certification. No real payment settlement, shipping, email delivery, merchant
deployment, distributed consistency or production capacity is claimed. Wishlist
metadata uses last-write-wins across simultaneous account writes. Guest order
confirmation links retain the starter's order-ID access model.

## Hosted execution

The public source is at [EliyahuEden/CommerceGuard](https://github.com/EliyahuEden/CommerceGuard).
The first hosted smoke attempt failed during fresh search-index initialization,
before correctness tests ran. Docker PostgreSQL and physical migrations succeeded.
The existing local database had hidden the missing first-index activation step.
The seed now uses the public Search Module API to activate a pending first index,
then preserves awaited per-product ingestion. Local repeat seed and backend
TypeScript checks pass. Hosted verification of the corrected revision follows.
[Initial failure record](evidence/enhancements/ci-initialization-initial.json).

Artifact upload now uses the Node 24 action and includes only the explicit report
and log paths, including hidden runtime logs; generated environment files remain
excluded. No product assertion, skip or retry was changed for this CI correction.

The corrected hosted smoke gate passed **22/22** in 23.89 seconds, plus the separate
seven-stage keyboard audit. The hosted k6 baseline passed **108 requests**, p95
184.67ms / p99 303.37ms, with zero HTTP/business failures. These Linux runner
measurements are separate from the local 432-request campaign.

The first hosted full matrix completed **151 pass / 2 fail**: CG-B001 and a mobile
profile selector that matched a hidden streaming copy. The trace shows a hidden
`S:1` fragment and the active main-content tree. The locator now requires one visible
editor instead of selecting an arbitrary copy. Existing save/reload assertions
remain. Profile inputs also have unique generated IDs; collapsed forms are natively
hidden, expansion is announced, and successful saves restore focus to Edit. The
profile copy no longer advertises an unavailable password-change control.

The strengthened profile check passed **12/12** (four projects × three cycles),
including keyboard editing, unique field names, scoped axe checks and persisted
updates. These are repeated checks, not additional unique cases.
[Initial hosted outcomes](evidence/enhancements/hosted-regression-initial-results.json),
[trace diagnosis](evidence/enhancements/profile-streaming-diagnostic.json),
[profile stability](evidence/enhancements/profile-stability-results.json),
[profile production build](evidence/enhancements/production-build-profile-fix.json).
