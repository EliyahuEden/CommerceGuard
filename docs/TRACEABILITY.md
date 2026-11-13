# Requirements traceability and coverage

Scenario IDs are embedded in test titles and manual cases. Parameterized invalid
quantity cases use API-Q0 and API-Q-1. These are requirement-based scenarios, not
source-code coverage percentages.

| Requirement | Acceptance criterion                                                                                      | Automated IDs                           | Manual       | Seeded defects               |
| ----------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------ | ---------------------------- |
| R-CATALOG   | Published products can be found, filtered and priced in region                                            | API-001–004; UI-001/002/009/011/020     | MAN-01/02    | —                            |
| R-CART      | Item edits persist with exact units and correct totals                                                    | API-007–010/016; UI-003–006; INT-001    | MAN-03/06    | CG-D01/03/04                 |
| R-INVENTORY | Invalid quantities/stock overflow cannot corrupt cart                                                     | API-Q0/Q-1/013/014; UI-002/005; INT-003 | MAN-04       | CG-D04 (quantity corruption) |
| R-PROMO     | CG10 reduces item amount by 10%, once; removal reverses it                                                | API-017–019; UI-007/008; INT-002        | MAN-05       | CG-D02                       |
| R-AUTH      | Unique identity registration; valid login; invalid login rejected                                         | API-020–022; UI-012–014                 | MAN-07/08    | CG-D05                       |
| R-ACCOUNT   | Profile changes persist and history belongs to its customer                                               | API-025/031; UI-016/017                 | MAN-09/11    | —                            |
| R-ACCESS    | Anonymous/forged/admin misuse denied; foreign address protected                                           | API-006/023/024/026/027; UI-015         | MAN-09/10    | —                            |
| R-ORDER     | Complete orders are consistent, invalid completion creates none, repeat completion is safe                | API-028–031; INT-004–006; UI-017        | MAN-11/12    | —                            |
| R-ERROR     | Useful structured errors or empty states preserve valid data                                              | API-005/015/030; UI-010/013             | MAN-02/08/12 | CG-D05                       |
| R-USABILITY | Critical controls work on three engines and mobile viewport                                               | All UI cases, four browser projects     | MAN-13       | —                            |
| R-DESIGN    | Local imagery loads; catalog links, skip link and responsive navigation work without overflow             | UI-018/019                              | MAN-13/14    | —                            |
| R-WISHLIST  | Guest selections survive reload, merge into the authenticated account and stay isolated                   | API-034/035; UI-021/022                 | MAN-15       | —                            |
| R-CHECKOUT  | Invalid address fields announce errors and preserve entered information                                   | UI-024; UI-017                          | MAN-18       | —                            |
| R-A11Y      | Key shopping routes expose labelled controls, sufficient contrast, keyboard focus and error announcements | UI-023/024/027                          | MAN-17/18    | —                            |

UI-020 extends R-CATALOG with selected-color photograph association. The complete
matrix now defines 35 API + 6 integration + 28 UI scenarios (69 unique). UI scenarios
are repeated across four projects; integration uses Chromium where a browser is
needed. Do not equate project executions with unique scenarios. Performance is a
separate workload and is not included in the Playwright test count.

The expanded catalog is checked by API-032/033 and UI-026 (MAN-16). Product size
information and modal zoom are checked by UI-023 (MAN-17). UI-025 checks actual
order statuses and a fresh, correctly priced buy-again cart; UI-028 protects account
order details from another customer (MAN-19). The 153 project executions include
112 UI executions. See the enhancement campaign for measured results; definitions
are not automatically counted as passes.
