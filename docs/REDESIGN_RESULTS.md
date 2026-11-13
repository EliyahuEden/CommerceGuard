# FORME redesign — verification record

Campaign: 11–12 November 2026, Asia/Jerusalem. Original Medusa pin and environment
are described in [AUT](AUT.md). This report separates the redesign from the
[original 105-execution campaign](STR.md). No hosted CI or deployment is implied.

## Changes delivered

The tracked FORME overlay adds an editorial homepage, local campaign/product
photography and fonts, responsive collection and filters, color-specific galleries,
cart/account/checkout layouts, and supporting demonstration information pages.
Commerce still uses real Medusa workflows and PostgreSQL. Catalog metadata and
image associations are seeded through official core workflows; prices, stock,
handles and SKUs are preserved.

The framework now defines 57 unique scenarios (31 API, 6 integration, 20 UI) and
117 project executions. New tests cover working homepage assets/catalog links,
keyboard skip navigation, responsive shopping navigation, viewport overflow and
selected-color imagery. Existing money, identity, order and SQL assertions remain.

## Measured campaigns

The final full matrix completed **117 project executions / 57 unique scenarios**
in **488.10 seconds**: **116 passed, 1 unexpected product failure, 0 skipped,
0 flaky, 0 retries**. It is not an entirely green regression release.

| Project         | Passed | Failed |
| --------------- | -----: | -----: |
| API             |     30 |      1 |
| Integration     |      6 |      0 |
| Chromium UI     |     20 |      0 |
| Firefox UI      |     20 |      0 |
| WebKit UI       |     20 |      0 |
| Mobile Chromium |     20 |      0 |

Source: [complete final case outcomes](evidence/redesign/regression-results.json).
The sole failure is API-013 / CG-B001, the independently discovered fractional
quantity issue. All **80 browser checks** and **6 database integration checks**
passed. The earlier Firefox readiness timeout did not recur in this full run.

The current PR smoke selection passed **48/48 executions** (16 critical cases ×
3 cycles), with **0 retries, skips or flaky outcomes**, in **108.08 seconds**.
[Measured smoke-repeat outcomes](evidence/redesign/stability-results.json).
This is the API/integration/Chromium selection used by the PR gate; it is a local
execution, not a hosted GitHub Actions run.

Five seeded defects completed **pass → assertion failure → pass**, for 10 passing
phase checks and 5 intentional failing checks. The runner returned success only
after restoration. [Measured phase results](evidence/redesign/defects/summary.json)
and [verified source hashes](evidence/redesign/defect-restoration.json) retain the
proof. No defect recovery record remained after the campaign.

[Production compilation](evidence/redesign/production-build.json) passed with
TypeScript checking enabled. QA, storefront and backend typechecks passed; targeted
overlay lint had 0 errors / 2 inherited React warnings, while seed lint reported
no issues. All three workflows passed actionlint. The repeated seed preserved all
four products, image associations and the manifest, as recorded in
[seed idempotency evidence](evidence/redesign/seed-idempotency.json).

The final visual capture covered seven routes at desktop (1440px) and mobile
(393px) widths: home, catalog, product, cart, account, checkout and about. All
**14 views** had **zero broken images, horizontal overflow, page errors or console
errors**. The four favicon/social-image endpoints returned HTTP 200. Screenshots
were inspected after capture, including corrected indexed product imagery and
mobile product controls. This is a focused visual review, not a full accessibility
or real-device audit. See the [homepage preview](evidence/redesign/screenshots/home-preview.png),
[native regression report](evidence/redesign/screenshots/regression-report.png),
[capture diagnostics](evidence/redesign/screenshots/diagnostics.json), and
[consolidated verification record](evidence/redesign/verification.json).

## Failures found and corrected during implementation

- **Product-link naming:** the new card markup needed explicit link names for
  consistent accessible navigation. Product links now expose their real title.
- **Variant image seed:** `variants.images` contains general product images as well
  as explicit assignments. Comparing that computed union caused the original seed
  to skip the intended color assignment. The corrected seed reads explicit
  image-to-variant relations, then adds/removes links through the core workflow.
  The backend response was inspected: each of the eight tee variants now receives
  exactly its black or white photograph. UI-020 checks both color transitions.
- **Navigation integration:** collection-to-account navigation sometimes returned
  to the collection because search-router cleanup wrote the old URL during
  unmount. The supported `cleanUrlOnDispose: false` setting prevents that cleanup
  from overwriting Next.js navigation. The focused navigation campaign passed
  [12/12](evidence/redesign/navigation-stability-results.json) across four projects
  and three repetitions before the final main-landmark refinement.
- **Cart readiness:** the quantity control stays disabled until its own client
  mount, so an SSR select cannot accept a change before its handler is available.
- **Fixture readiness budget:** one Firefox case timed out waiting for the initial
  root hydration signal. That wait now shares the existing 60s navigation budget;
  business actions/assertions retain their 15s budget. No automatic retry was added.
- **Typed seed reads:** backend typechecking caught a concrete module method that
  was absent from the public TypeScript interface. Explicit image associations now
  use Query Graph with nullable relation entries handled safely. The catalog
  remained unchanged on the repeated seed. CI checks the prepared backend as well
  as the QA and storefront projects.
- **Search-index consistency:** visual review found that the Shorts search hit
  still held its upstream title/image after product metadata had changed. The
  strengthened API-001 assertion compared indexed titles/images with the product
  API and [failed with the stale values](evidence/redesign/search-drift-before-results.json).
  Local event delivery can outlive a CLI seed process. The seed now explicitly
  awaits the Search Module's supported ingestion method for each controlled
  product, including on repeat runs, so derived search data is reconciled before
  the CLI exits. This is a CommerceGuard setup fix, separate from CG-B001.
  The [same assertion passed after ingestion](evidence/redesign/search-drift-after-results.json).
- **Cold-start recovery:** on this OneDrive host, a cold backend became healthy
  just after the former 180s startup deadline. Startup now has a bounded 300s
  budget and can resume an owned backend-only partial start. The resumed command
  completed successfully. These lifecycle limits are separate from test assertions.
- **Keyboard portability:** WebKit's native tab-navigation preference differs by
  platform. The automated skip-link case checks keyboard activation and focus
  transfer; complete Tab order and assistive-technology behavior remain manual work.

The initial focused campaign recorded
[8 pass / 5 fail](evidence/redesign/focused-initial-results.json): four color-image
failures and one WebKit initial-focus assumption. After those changes, the next
focused run recorded [12 pass / 1 fail](evidence/redesign/focused-pre-router-results.json),
exposing the navigation integration issue. The first complete redesigned matrix
recorded [115 pass / 2 fail](evidence/redesign/regression-initial-results.json):
the known product defect and the Firefox readiness timeout. These results remain
preserved rather than being overwritten by the final campaign.

An earlier broad run was stopped during debugging; no complete pass count is claimed
for it. Selected original diagnostic contexts remain under `evidence/redesign/initial/`.
A screenshot capture also stopped on its default 5s catalog wait; the standalone
capture script now uses the suite's 15s assertion budget and is run separately.
Visual review then exposed a capture-helper issue: setting image loading attributes
before selective hydration caused React console warnings and a development badge.
Capture now scrolls to load images naturally, leaves React-owned attributes alone,
and asserts no console errors as well as no page errors. This was an evidence-tool
fix; application source and the completed regression results were unaffected.
Another final-run attempt was interrupted when local processes stopped while the
chat was inactive. It is not counted as a completed campaign. Work was explicitly
paused and saved afterward, then resumed from the same source and database.

These implementation and integration fixes are separate from the five deliberately
injected defects and the independently discovered upstream fractional-quantity bug.

## Evidence and reproduction

With the prepared application running:

```sh
npm run test:regression
npm run test:stability
npm run test:defects
npm run storefront:build
npm run evidence:screenshots
```

The local verification used the workspace Node 22.23.4 binary because the host's
global Node 20 is incompatible. Reports used distinct `CG_JSON_REPORT`,
`CG_HTML_DIR`, `CG_OUTPUT_DIR`, and `CG_JUNIT_REPORT` locations so campaigns do not
destroy one another. The defect rerun uses `CG_DEFECT_EVIDENCE_DIR`; design capture
uses `CG_DESIGN_REVIEW=1` and `CG_SCREENSHOT_DIR`.

Production compilation temporarily stops only the CommerceGuard-owned storefront
to avoid concurrent writes to `.next`, then restores and warms the local preview.
It requires the prepared backend/database. This verifies compilation; it is not
a production deployment or a production-server soak test.

## Publication limits and next work

Keep CG-B001 visible: accepting `1.5` units as `2` remains an open product finding.
Do not describe the regression as fully green while it fails. Hosted GitHub Actions
and the Docker Compose path remain unverified on this Windows host. Publish only
after running those checks on a suitable runner and reviewing the open finding.

The production build completed, with warnings about the pinned starter's middleware
convention and Next.js Edge Runtime imports. These warnings were not suppressed;
review the middleware-to-proxy migration before treating this as a deployed shop.
The inherited search pagination code also has two nonblocking React ref lint
warnings. A passing build is not a substitute for those deployment checks.

Other planned work: full accessibility/keyboard and real-device testing; low-stock
and distributed order-submission races; multi-currency tax rounding; payment failure
and refund scenarios. The k6 results in STR are the earlier local read-only baseline
and ramp; no storefront performance improvement is claimed.
