# Requirements traceability and coverage

Scenario IDs are embedded in test titles and manual cases. Parameterized invalid
quantity cases use API-Q0 and API-Q-1. These are requirement-based scenarios, not
source-code coverage percentages.

| Requirement | Acceptance criterion                                                                       | Automated IDs                           | Manual       | Seeded defects               |
| ----------- | ------------------------------------------------------------------------------------------ | --------------------------------------- | ------------ | ---------------------------- |
| R-CATALOG   | Published products can be found, filtered and priced in region                             | API-001–004; UI-001/002/009/011         | MAN-01/02    | —                            |
| R-CART      | Item edits persist with exact units and correct totals                                     | API-007–010/016; UI-003–006; INT-001    | MAN-03/06    | CG-D01/03/04                 |
| R-INVENTORY | Invalid quantities/stock overflow cannot corrupt cart                                      | API-Q0/Q-1/013/014; UI-002/005; INT-003 | MAN-04       | CG-D04 (quantity corruption) |
| R-PROMO     | CG10 reduces item amount by 10%, once; removal reverses it                                 | API-017–019; UI-007/008; INT-002        | MAN-05       | CG-D02                       |
| R-AUTH      | Unique identity registration; valid login; invalid login rejected                          | API-020–022; UI-012–014                 | MAN-07/08    | CG-D05                       |
| R-ACCOUNT   | Profile changes persist and history belongs to its customer                                | API-025/031; UI-016/017                 | MAN-09/11    | —                            |
| R-ACCESS    | Anonymous/forged/admin misuse denied; foreign address protected                            | API-006/023/024/026/027; UI-015         | MAN-09/10    | —                            |
| R-ORDER     | Complete orders are consistent, invalid completion creates none, repeat completion is safe | API-028–031; INT-004–006; UI-017        | MAN-11/12    | —                            |
| R-ERROR     | Useful structured errors or empty states preserve valid data                               | API-005/015/030; UI-010/013             | MAN-02/08/12 | CG-D05                       |
| R-USABILITY | Critical controls work on three engines and mobile viewport                                | All UI cases, four browser projects     | MAN-13       | —                            |

The complete matrix contains 31 API + 6 integration + 17 UI scenarios. UI scenarios
are repeated across four projects; integration uses Chromium where a browser is
needed. Do not equate project executions with unique scenarios. Performance is a
separate workload and is not included in the Playwright test count.
