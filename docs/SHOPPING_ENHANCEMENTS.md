# FORME shopping enhancements

These are real features on the pinned Medusa application, maintained as tracked
overlays. Existing commerce fixtures remain reproducible. New behavior has its
own requirements and regression cases rather than inheriting a pass from an older
campaign.

## Catalog and product information

`storefront/catalog.json` describes ten products. Six new pieces have individual
local images, Size/Color options, EUR/USD prices, stock levels and three named
collections: Everyday Essentials, Off Duty and Considered Layers. A hoodie size is
unavailable and the cream knit has scarce stock. All three collections are reachable through the storefront footer, and their
pages list the real linked products. The original EUR10 tee fixture
is deliberately retained for independent money assertions.

`aut/catalog.ts` uses official collection/category/product/inventory workflows.
Products and inventory levels are created only when missing; repeat seeding does
not replenish inventory or change original fixture prices. The main seed reconciles
presentation metadata, explicit image associations and derived search documents.
Do not change database rows to implement catalog behavior.

The owner's [Baymard sizing reference](https://baymard.com/research-articles/apparel-size-information)
informed the placement of sizing help beside product choices. Our guide identifies
the units and body areas and includes simple measurement advice; it does not claim
to implement every recommendation in that research.

Fit, fabric and care appear on product pages. The size guide explains body
measurements and explicitly identifies fictional specifications. Native modal
zoom enlarges the selected product photograph. Dialogs have accessible names,
Escape dismissal, focus containment and focus restoration.

## Wishlist persistence and authentication

Guests save up to 100 unique product IDs in browser localStorage under
`forme.guest-wishlist.v1`. Signed-in customers use the real authenticated Medusa
customer metadata namespace `forme_wishlist`. A server action derives ownership
from the HttpOnly session; it accepts no target customer ID from the browser.

On login, the provider unions the guest and account lists, saves them to the
authenticated account, and only then clears the guest list. Existing account
selections are preserved. An account-layout observer handles login without a URL
change. Logout does not copy account selections into guest storage. An independent
browser can retrieve the account list. Failures keep saved data and announce the
problem; they are not treated as successful writes.

This is a bounded portfolio implementation using the existing customer metadata
contract. Simultaneous writes from several signed-in tabs use last-write-wins
semantics; it is not a dedicated conflict-resolving wishlist service.

## Checkout and order experience

Address fields are controlled React values, with real labels, autocomplete,
associated inline errors and a visible error summary. Mobile uses one column.
Both client and server validate required fields/email; the server verifies that
the country belongs to the cart region. Failed validation or a failed API write
retains the entered values. Separate billing addresses remain supported. After a
successful write, the real cart records preserve addresses when returning to edit.
The progress indicator identifies Address, Delivery, Payment and Review.

Confirmation and details show actual order/payment/fulfillment statuses. The UI
does not claim email delivery or shipment in this local demonstration. Account
order pages validate the logged-in customer before rendering metadata or details.
Guest confirmation URLs retain the starter's order-ID access model.

Buy again requires the order owner. It submits original variant IDs and quantities
through the real create-cart workflow, which validates current price and stock.
The browser switches to the fresh bag only after creation succeeds. It never
copies a historical price, promotion, delivery selection or payment session, and
never creates another order. An unavailable item produces an actionable error
while preserving the existing bag. Quantities outside the storefront's 1–10 range
must be selected again manually.

## Accessibility and verification

The pass includes proper input labels, named password/delete controls, adequate
target sizes, corrected text contrast, removal of nested link/button controls,
error announcements, visible focus and dialog keyboard behavior. Playwright/axe
checks WCAG A/AA rules on home, catalog, product, account, wishlist, collection, cart and address
checkout in all browser projects. Scans cover the rendered states in those tests;
they are not comprehensive WCAG certification or proof of real screen-reader/device
behavior.

Automated IDs: API-032–034, UI-021–028, plus the retained purchase and database
checks. See [requirements audit](REQUIREMENTS_AUDIT.md),
[traceability](TRACEABILITY.md) and the measured evidence under
`docs/evidence/enhancements/`. Source under `.aut/` is prepared output; edit tracked
overlays and reapply them using the documented commands.

## Read endpoint and release execution

The implemented same-origin `GET /api/wishlist` returns only the authenticated
session's customer ID and saved IDs, with private/no-store cache headers. A supplied
customer selector cannot choose another account. Reads use ordinary abortable fetch
requests instead of Next.js's serialized Server Action queue; authenticated writes
remain Server Actions. API-035 independently checks this boundary.

Quality gates use `npm run aut:start:production` to compile and run the real Next.js
production server. Controlled source mutation uses development mode so each patch
is compiled in isolation. `npm run test:keyboard` separately verifies a complete
Chromium keyboard-only purchase and history journey, with axe scans in delivery,
payment and review. Its audit is separate from the 153 Playwright project executions.

Local HTTP testing explicitly enables non-Secure cookies only when both configured
origins are loopback ports 8000/9000 and `COMMERCEGUARD_LOCAL_TEST=true`. This flag
is generated by local setup. Other production configurations retain Secure cookies.

The responsive menu panel now reserves its outer margins instead of combining
100% width with margins. This corrects a transient mobile layout-viewport expansion
found by UI-019 during the first complete enhancement run.

Authenticated profile coverage additionally checks keyboard editing and save/reload
persistence. Inputs use unique React IDs, collapsed fields are natively hidden,
disclosures expose their expanded state, and focus returns to Edit after save.
The active editor locator excludes Next.js's hidden streaming fragments and still
requires exactly one visible editor. No retry or arbitrary first-match selection
handles this lifecycle.
