# Defect classification

Severity describes product impact; priority describes repair order.

| Severity    | Definition                                               | Commerce example                                                 |
| ----------- | -------------------------------------------------------- | ---------------------------------------------------------------- |
| S1 Critical | Broad outage, security breach or irrecoverable data loss | Other customers' personal/order data exposed                     |
| S2 High     | Core purchase flow or financial/data correctness broken  | Wrong charged amount, silently changed quantity, duplicate order |
| S3 Medium   | Workflow degraded with a practical workaround            | Invalid login has no feedback; retry after reopening a page      |
| S4 Low      | Cosmetic or minor consistency issue                      | Non-blocking alignment/text defect                               |

| Priority | Handling                                  |
| -------- | ----------------------------------------- |
| P0       | Stop release and investigate immediately  |
| P1       | Repair before the next applicable release |
| P2       | Schedule in the next normal iteration     |
| P3       | Backlog with rationale                    |

Seeded display/calculation/quantity examples are S2/P1; suppressed login feedback is
S3/P2. Final priority for an independently discovered upstream issue requires product
triage and can differ from its technical severity.
