# Risk-based testing strategy

Likelihood and impact use 1 (low) to 5 (high). Scores prioritize effort; they are
engineering estimates, not measured probabilities.

| Risk                            |      L × I | Mitigation and release signal                                                     |
| ------------------------------- | ---------: | --------------------------------------------------------------------------------- |
| Incorrect charges/discounts     | 4 × 5 = 20 | Independent arithmetic, UI/API/SQL comparison, CG-D01/D02, smoke gate             |
| Invalid stock or quantities     | 4 × 4 = 16 | Negative and overflow requests, no-write SQL checks, UI limits, CG-D03/D04        |
| Customer data exposed           | 3 × 5 = 15 | Identity isolation, forged/anonymous access and foreign address deletion checks   |
| Lost or duplicate orders        | 3 × 5 = 15 | Real manual-payment checkout, sequential duplicate completion, one SQL link       |
| Authentication unusable         | 3 × 4 = 12 | Fresh registration/login/logout, invalid login feedback, CG-D05                   |
| Browser/mobile checkout failure | 3 × 4 = 12 | Four-project UI matrix and manual device charter                                  |
| Search hides sellable products  |  3 × 3 = 9 | Real search/index seed, category refinement, empty-state tests                    |
| Shared data causes flaky tests  | 3 × 4 = 12 | Per-case carts/customers, no reused auth state, two bounded workers, zero retries |
| Slow API degrades conversion    |  3 × 3 = 9 | Local baseline/ramp, latency/error/business thresholds                            |
| AUT updates invalidate tests    | 4 × 3 = 12 | Commit and frozen lockfile; explicit version upgrade checklist                    |

Smoke selection concentrates on money, stock-independent cart operations, identity,
access, complete checkout and persisted order items. Regression adds destructive-to-
test-data edge cases and cross-engine breadth. Performance remains separate so the
PR gate is predictable. Local in-memory event/lock/cache adapters match the starter's
default configuration; their results do not establish distributed consistency.

Residual risks: true race-condition duplicate submission and distributed locks;
low remaining stock races; tax-inclusive pricing, currency rounding across regions,
payment failures and refunds; email verification when enabled; real mobile devices;
full accessibility/security audit. These are explicit gaps, not mocked successes.

The FORME redesign also introduces presentation risks: stale catalog data, unnamed
product links, image/color mismatch, mobile overflow, and pre-hydration interactions.
UI-018–020 cover selected cases; catalog requests are current, product links have
explicit names, and cart quantity controls wait for their own client mount. The
overlay is tracked and exact-match patches fail visibly when upstream changes.

Enhancement risks and controls:

| Risk                                                    | Control                                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Guest wishlist lost on login or another account exposed | API-034/035 and UI-021/022 check merge, private caching and session ownership        |
| Cross-customer order details or repeat charge           | UI-025/028 verify ownership, current totals and no additional order creation         |
| Address errors erase a shopper's work                   | UI-024 checks retained values, associated errors and mobile field geometry           |
| Unavailable size remains purchasable                    | API-033 and UI-026 check real zero-stock inventory                                   |
| Product sizing/zoom or checkout unusable by keyboard    | UI-023/027 plus a separate keyboard-only purchase audit and state-specific axe scans |

Wishlist metadata uses last-write-wins across concurrent tabs. The size guide is
fictional demonstration data, not measured garment specifications. Guest confirmation
links retain the upstream order-ID access model. These limits remain documented.
