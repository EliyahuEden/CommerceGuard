# Defect reports and controlled experiments

Build: pinned Medusa DTC Starter `0a84b2ac13dbf5091a84af4b54ce0b19f6c9ad55`.
Local Windows/PostgreSQL environment, 2026-11-11. Severity definitions are in
`SEVERITY_PRIORITY.md`. Intentionally seeded defects and discoveries are separate.

## Independently discovered: CG-B001 — accepted fractional units silently change

**Status:** Open, reproducible, not reported upstream. **Severity:** S2 High.
**Suggested priority:** P1, pending product-owner triage. **Requirement:** R-INVENTORY.
**Detector:** API-013, tagged `@product-bug`; it remains a normal failing regression
test, with no retry, skip or expected-failure annotation.

Reproduction:

1. Start the pinned AUT with migrations and the controlled seed.
2. Create a fresh cart with `POST /store/carts` and its EUR region ID.
3. `POST /store/carts/:id/line-items` with the seeded T-Shirt variant and
   `{"variant_id":"<actual variant>","quantity":1.5}`.
4. Inspect status, returned line quantity/total and the cart's SQL line.
5. Or run `npm run defect:reproduce` to save the actual request/response/SQL evidence;
   the command exits nonzero when silent coercion reproduces.

**Expected:** Reject the fractional input with a validation error, or preserve the
accepted quantity and calculate its amount precisely. Silently changing a buyer's
submitted units is unacceptable under either policy.

**Actual:** HTTP 200, returned quantity **2**, unit price EUR 10, total **EUR 20**;
SQL also records quantity 2. No validation error informs the client of the change.
The installed route validator accepts `z.number().gt(0)` without an integer check,
while the actual SQL quantity column is `integer` (recorded in the evidence).
This mismatch supports investigating validation/persistence consistency; a full
upstream root-cause analysis and fix have not been completed.

**Impact:** A client can receive a successful response after the purchase units and
price change. The current browser's integer select does not expose this API input,
so browser happy paths alone do not detect it.

**Evidence:** [actual request, response and SQL](evidence/quantity-coercion.json),
[full regression case outcomes](evidence/regression-results.json),
[initial API finding](evidence/api-initial-results.json). This is not one of the five
seeded examples. No third-party source fix is silently applied.

## Controlled source mutations

Each experiment runs on the ignored local checkout. All are deliberately introduced,
not claims about defects shipped by Medusa. Exact source anchors and replacements
are in `../defects/scenarios.json`. Run `npm run test:defects` with the AUT running.
The runner serializes experiments and restarts/warms the storefront between source
versions. A baseline must pass; an injected build must fail one **assertion**; source
is restored in `finally`; the identical detecting test must then pass. A timeout or
compilation failure is not accepted as successful defect detection.

| ID     | Severity / priority | Reproduction and injected behavior                                                      | Expected / oracle                                                                                                                                     | Detector |
| ------ | ------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| CG-D01 | S2 / P1             | Add one T-Shirt, choose quantity 3. Patch cart total formatting to add EUR 1.           | Display EUR 30.00. Injected display EUR 31.00 while API/data attribute stay 30; independent text assertion detects the customer-visible discrepancy.  | UI-004   |
| CG-D02 | S2 / P1             | Cart with three units, apply CG10. Patch discount formatting to multiply by 2.          | Discount EUR 3.00 and total EUR 27.00. Injected discount label EUR 6.00; text assertion detects it even though API and data attribute remain correct. | UI-007   |
| CG-D03 | S2 / P1             | Open selected T-Shirt variant and click Add once. Patch submitted quantity from 1 to 2. | One unit and EUR 10. The real backend receives two units; cart badge/quantity assertion fails.                                                        | UI-003   |
| CG-D04 | S2 / P1             | Cart with one unit; select quantity 3. Patch submitted quantity to selection + 1.       | Persist three units/EUR 30. Real cart becomes four/EUR 40 and the selection assertion detects it.                                                     | UI-004   |
| CG-D05 | S3 / P2             | Submit nonexistent credentials. Patch login error prop to null.                         | Visible authentication error with login form preserved. Backend still returns rejection, but no message is rendered; visibility assertion fails.      | UI-013   |

For each report, use the table's steps, the manifest's exact patch, and the
baseline/injected/restored JSON under `evidence/defects/<ID>/`. Injected screenshots
are saved alongside JSON. `evidence/defects/summary.json` is the authoritative measured
campaign record and includes original-source hashes and outcomes.

Recorded failure screenshots: [CG-D01](evidence/defects/CG-D01/injected/test-failed-1.png),
[CG-D02](evidence/defects/CG-D02/injected/test-failed-1.png),
[CG-D03](evidence/defects/CG-D03/injected/test-failed-1.png),
[CG-D04](evidence/defects/CG-D04/injected/test-failed-1.png),
[CG-D05](evidence/defects/CG-D05/injected/test-failed-1.png).

The recorded campaign's durable evidence is JSON and copied screenshots. The runner
now allocates separate `.runtime/defects/<ID>/<phase>` folders so future campaigns
retain traces/HTML from injected phases after their restoration checks. Raw report
attachment paths are machine-local; the checked-in screenshots above are portable.

The first experimental run was rejected when a hydration wait timed out during hot reload,
timeout, not a money assertion. The source was restored and the harness correctly
refused to count it. `evidence/defects/rejected-hmr-timeout.json` retains that rejected
attempt. Restarting the owned storefront between patches removes this ambiguity.

Recovery: Ctrl+C/SIGTERM restores the backed-up source. After an uncatchable hard kill,
run `node scripts/defects.mjs --restore`, then restart the storefront. The runner
refuses a new campaign when an interrupted backup exists. `git diff` on all five
target files should be empty after completion; unrelated admin/readiness setup
changes remain intentional.
