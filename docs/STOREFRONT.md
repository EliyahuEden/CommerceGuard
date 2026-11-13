# FORME — the CommerceGuard storefront

FORME is an original visual identity and Next.js storefront redesign on the pinned
Medusa DTC Starter. Keeping Medusa preserves a realistic commerce system for the QA
portfolio: actual API contracts, payment sessions, orders, inventory, authentication,
search indexing, and PostgreSQL records. Building another backend would increase
maintenance and reduce the independence of testing an established application.

## Design and implementation

- Warm ivory surfaces, ink typography, muted sage accents, generous spacing, and
  locally hosted Manrope / DM Serif Display fonts.
- Original campaign, editorial, and coordinated garment imagery. Thirteen WebP delivery
  assets total 913,106 bytes. PNG originals and generation prompts are retained.
- Responsive homepage, real searchable/refinable collection, product gallery,
  color-specific photographs, cart, account, checkout, and supporting information pages.
- Real region prices, selected variants, availability, quantity edits, CG10 promotion,
  registration/login, and manual-payment order creation remain Medusa workflows.
- Search URL cleanup is disabled on unmount so it cannot overwrite a Next.js
  navigation away from the collection. This uses the documented
  [InstantSearch history router option](https://www.algolia.com/doc/api-reference/widgets/history-router/react#parameter-cleanurlondispose).
- Keyboard skip link, visible focus treatment, labelled navigation, mobile filter
  toggle, and reduced-motion support. These are targeted improvements, not a claim
  of a completed WCAG audit.
- Clear demonstration disclosures. No fabricated reviews, commercial shipping
  promises, newsletter subscription, support inbox, or real payment integration.

## Source separation and reproducibility

```text
storefront/
  overrides/src/          Original layouts, components and scoped design styles
  public/forme/           Local imagery, fonts and their license notices
  catalog.json           Product presentation, collections and new product seed data
  patches.json           Small, exact-match changes to pinned upstream files
  ASSET_PROVENANCE.md     Image prompts, origin and delivery optimization
  UPSTREAM_LICENSE       Medusa MIT notice for adapted components
scripts/storefront.mjs    Guarded, idempotent overlay application
aut/seed.ts              Catalog updates through official Medusa core workflows
.aut/dtc-starter/         Ignored pinned third-party checkout and dependencies
```

`npm run aut:prepare` applies the tracked overlay after installing the pinned
application. `npm run aut:seed` updates presentation metadata and image links
through `updateProductsWorkflow` / `batchVariantImagesWorkflow`, then exports the real
product title and IDs for tests. Original fixture prices, inventory, SKUs and handles
are preserved. `aut/catalog.ts` creates six additional products, variants, prices,
collections and inventory levels through official core workflows. A repeated seed
creates only missing levels and never replenishes existing stock.
No direct database writes implement catalog behavior.

The CLI also awaits supported Search Module ingestion for every controlled product,
including repeat seeds. This prevents asynchronous event delivery from leaving the
last search document stale when the CLI exits. API-001 compares indexed titles and
images with the product API so future seed drift blocks the smoke gate.

For local design edits:

```sh
npm run storefront:apply
npm run aut:restart
npm run storefront:typecheck
npm run storefront:build
```

Edit `storefront/overrides`, then reapply. Editing only the ignored checkout does not
produce a reproducible project change. Setup saves original overwritten files under
ignored `.runtime/storefront-original/`; it rejects mismatched patch anchors.
`npm run aut:prepare` is safe to repeat on this pin; upgrades require reviewing every
overlay/patch against the new upstream version.

Catalog requests bypass the Next.js data cache, and product pages render dynamically
so controlled seed/inventory updates appear in tests. This is an intentional local
QA tradeoff; a production shop would need an explicit cache invalidation design.
The upstream TypeScript build-error bypass is disabled. Development indicators are
disabled in the demonstration UI; test failures and browser errors remain visible
in their reports.

Production compilation is available through `storefront:build` with the backend
running. It stops only the owned storefront while building and restores the preview
afterward, including on a failed build. PR and regression workflows check the QA,
storefront and prepared backend TypeScript projects.

## Validation and history

The original working QA baseline is retained in local Git tag `baseline-medusa-qa`.
The earlier campaign remains under `docs/evidence/`; redesigned-storefront results
and screenshots are kept separately in `docs/evidence/redesign/` and described in
[the redesign verification report](REDESIGN_RESULTS.md).

The framework now defines 69 unique scenarios: 35 API, 6 integration, and 28 UI; the UI cases
run in four projects (153 total project executions). UI-018 checks homepage imagery
and catalog links; UI-019 checks keyboard navigation, responsive menu, and overflow;
UI-020 checks real color-to-image associations. Existing business assertions were
retained, including the open fractional-quantity product failure.

## Attribution and limits

Adapted upstream components retain the [Medusa MIT license](../storefront/UPSTREAM_LICENSE).
The independent QA framework and FORME presentation work are maintained here.
The font OFL notices ship next to the font files. Image prompts and the illustrative
nature of the fictional inventory are documented in
[asset provenance](../storefront/ASSET_PROVENANCE.md).

This remains a local portfolio demonstration. Real payment gateways, fulfillment,
production legal policies, email delivery, distributed locks, real-device testing,
and a full accessibility/security audit are outside the verified scope. Public source publication and hosted Actions are recorded in the
[requirements audit](REQUIREMENTS_AUDIT.md). This is not a merchant deployment.
