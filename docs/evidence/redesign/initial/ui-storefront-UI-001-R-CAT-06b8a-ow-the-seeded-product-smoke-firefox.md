# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui\storefront.spec.ts >> UI-001 R-CATALOG product browsing and details show the seeded product @smoke
- Location: tests\ui\storefront.spec.ts:14:1

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByTestId('products-list').getByRole('link', { name: /Essential T-Shirt/ })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - main [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - text: A little less. A little better.
        - link "Discover the everyday edit" [ref=e6] [cursor=pointer]:
          - /url: /dk/store
          - text: Discover the everyday edit ↗
      - generic [ref=e7]:
        - link "FORME home" [ref=e9] [cursor=pointer]:
          - /url: /dk
          - text: FORME
        - navigation "Main navigation" [ref=e11]:
          - link "Shop all" [ref=e12] [cursor=pointer]:
            - /url: /dk/store
          - link "The essentials" [ref=e13] [cursor=pointer]:
            - /url: /dk/categories/shirts
          - link "Our approach" [ref=e14] [cursor=pointer]:
            - /url: /dk/about
        - generic [ref=e15]:
          - link "Search products" [ref=e16] [cursor=pointer]:
            - /url: /dk/search
          - link "Account" [ref=e19] [cursor=pointer]:
            - /url: /dk/account
          - button [ref=e26] [cursor=pointer]:
            - link "Cart (0)" [ref=e27]:
              - /url: /dk/cart
    - generic [ref=e28]:
      - generic [ref=e29]:
        - generic [ref=e30]: THE FORME COLLECTION
        - heading "All products" [level=1] [ref=e31]
        - paragraph [ref=e32]: A small edit. Everyday possibilities.
      - generic [ref=e33]:
        - complementary "Product filters" [ref=e34]:
          - generic [ref=e35]:
            - heading "Refine your edit" [level=2] [ref=e36]
            - generic [ref=e37]:
              - generic [ref=e38]: Category
              - list [ref=e39]:
                - listitem [ref=e40]:
                  - generic [ref=e41] [cursor=pointer]:
                    - checkbox "Merch (1)" [ref=e42]
                    - generic [ref=e43]: Merch
                    - generic [ref=e44]: (1)
                - listitem [ref=e45]:
                  - generic [ref=e46] [cursor=pointer]:
                    - checkbox "Pants (1)" [ref=e47]
                    - generic [ref=e48]: Pants
                    - generic [ref=e49]: (1)
                - listitem [ref=e50]:
                  - generic [ref=e51] [cursor=pointer]:
                    - checkbox "Shirts (1)" [ref=e52]
                    - generic [ref=e53]: Shirts
                    - generic [ref=e54]: (1)
                - listitem [ref=e55]:
                  - generic [ref=e56] [cursor=pointer]:
                    - checkbox "Sweatshirts (1)" [ref=e57]
                    - generic [ref=e58]: Sweatshirts
                    - generic [ref=e59]: (1)
            - generic [ref=e60]:
              - generic [ref=e61]:
                - heading [level=3] [ref=e62]:
                  - button "Color (0)" [expanded] [ref=e63] [cursor=pointer]:
                    - generic [ref=e64]:
                      - generic [ref=e65]: Color
                      - generic [ref=e66]: (0)
                - region "Color (0)" [ref=e72]:
                  - generic [ref=e73]:
                    - button "Black (1)" [ref=e74] [cursor=pointer]:
                      - text: Black
                      - generic [ref=e75]: (1)
                    - button "White (1)" [ref=e76] [cursor=pointer]:
                      - text: White
                      - generic [ref=e77]: (1)
              - generic [ref=e78]:
                - heading [level=3] [ref=e79]:
                  - button "Size (0)" [expanded] [ref=e80] [cursor=pointer]:
                    - generic [ref=e81]:
                      - generic [ref=e82]: Size
                      - generic [ref=e83]: (0)
                - region "Size (0)" [ref=e89]:
                  - generic [ref=e90]:
                    - button "L (4)" [ref=e91] [cursor=pointer]:
                      - text: L
                      - generic [ref=e92]: (4)
                    - button "M (4)" [ref=e93] [cursor=pointer]:
                      - text: M
                      - generic [ref=e94]: (4)
                    - button "S (4)" [ref=e95] [cursor=pointer]:
                      - text: S
                      - generic [ref=e96]: (4)
                    - button "XL (4)" [ref=e97] [cursor=pointer]:
                      - text: XL
                      - generic [ref=e98]: (4)
            - generic [ref=e99]:
              - paragraph [ref=e100]: Sort by
              - generic [ref=e101]:
                - generic [ref=e102]: Relevance
                - generic [ref=e106]: Latest Arrivals
                - generic [ref=e108]: "Price: Low -> High"
                - generic [ref=e110]: "Price: High -> Low"
                - generic [ref=e112]: "Title: A -> Z"
                - generic [ref=e114]: "Title: Z -> A"
        - generic [ref=e116]:
          - searchbox "Search products" [ref=e120]
          - list [ref=e121]:
            - listitem [ref=e122]:
              - link [ref=e123] [cursor=pointer]:
                - /url: /dk/products/shorts
                - article [ref=e124]:
                  - generic [ref=e125]:
                    - img "Medusa Shorts" [ref=e127]
                    - generic [ref=e128]: THE EVERYDAY EDIT
                    - generic [aria-hidden] [ref=e129]: ↗
                  - generic [ref=e130]:
                    - heading "Medusa Shorts" [level=3] [ref=e132]
                    - paragraph [ref=e134]: €10.00
            - listitem [ref=e135]:
              - link [ref=e136] [cursor=pointer]:
                - /url: /dk/products/t-shirt
                - article [ref=e137]:
                  - generic [ref=e138]:
                    - img "Essential T-Shirt" [ref=e140]
                    - generic [ref=e141]: THE EVERYDAY EDIT
                    - generic [aria-hidden] [ref=e142]: ↗
                  - generic [ref=e143]:
                    - heading "Essential T-Shirt" [level=3] [ref=e145]
                    - paragraph [ref=e147]: €10.00
            - listitem [ref=e148]:
              - link [ref=e149] [cursor=pointer]:
                - /url: /dk/products/sweatpants
                - article [ref=e150]:
                  - generic [ref=e151]:
                    - img "Relaxed Sweatpants" [ref=e153]
                    - generic [ref=e154]: THE EVERYDAY EDIT
                    - generic [aria-hidden] [ref=e155]: ↗
                  - generic [ref=e156]:
                    - heading "Relaxed Sweatpants" [level=3] [ref=e158]
                    - paragraph [ref=e160]: €10.00
            - listitem [ref=e161]:
              - link [ref=e162] [cursor=pointer]:
                - /url: /dk/products/sweatshirt
                - article [ref=e163]:
                  - generic [ref=e164]:
                    - img "Everyday Sweatshirt" [ref=e166]
                    - generic [ref=e167]: THE EVERYDAY EDIT
                    - generic [aria-hidden] [ref=e168]: ↗
                  - generic [ref=e169]:
                    - heading "Everyday Sweatshirt" [level=3] [ref=e171]
                    - paragraph [ref=e173]: €10.00
    - generic [ref=e175]:
      - generic [ref=e176]:
        - generic [ref=e177]:
          - link "FORME" [ref=e178] [cursor=pointer]:
            - /url: /dk
          - paragraph [ref=e180]: For the way you move.For the everyday.
        - generic [ref=e181]:
          - generic [ref=e182]:
            - heading "The collection" [level=2] [ref=e183]
            - link "Shop all" [ref=e184] [cursor=pointer]:
              - /url: /dk/store
            - link "T-shirts" [ref=e185] [cursor=pointer]:
              - /url: /dk/categories/shirts
            - link "Sweatshirts" [ref=e186] [cursor=pointer]:
              - /url: /dk/categories/sweatshirts
            - link "Sweatpants" [ref=e187] [cursor=pointer]:
              - /url: /dk/categories/pants
          - generic [ref=e188]:
            - heading "Here to help" [level=2] [ref=e189]
            - link "My account" [ref=e190] [cursor=pointer]:
              - /url: /dk/account
            - link "Shipping" [ref=e191] [cursor=pointer]:
              - /url: /dk/shipping
            - link "Returns" [ref=e192] [cursor=pointer]:
              - /url: /dk/returns
            - link "Contact" [ref=e193] [cursor=pointer]:
              - /url: /dk/contact
          - generic [ref=e194]:
            - heading "Considered by design" [level=2] [ref=e195]
            - link "Our approach" [ref=e196] [cursor=pointer]:
              - /url: /dk/about
            - link "Privacy" [ref=e197] [cursor=pointer]:
              - /url: /dk/privacy
            - link "Terms" [ref=e198] [cursor=pointer]:
              - /url: /dk/terms
      - generic [ref=e199]:
        - generic [ref=e200]: © 2026 FORME. A CommerceGuard demonstration store.
        - generic [ref=e201]:
          - text: Powered by
          - link "Medusa" [ref=e202] [cursor=pointer]:
            - /url: https://medusajs.com
          - text: · Designed for everyday.
  - alert [ref=e203]
```

# Test source

```ts
  1   | import { test, expect } from "../../src/fixtures/test.js"
  2   | import {
  3   |   ProductPage,
  4   |   CartPage,
  5   |   AccountPage,
  6   |   CheckoutPage,
  7   |   setCart,
  8   |   setCustomer,
  9   |   openPage,
  10  | } from "../../src/pages/storefront.js"
  11  | import { customerData } from "../../src/data/factories.js"
  12  | import { jsonOk } from "../../src/api/store-client.js"
  13  | 
  14  | test("UI-001 R-CATALOG product browsing and details show the seeded product @smoke", async ({
  15  |   page,
  16  |   seed,
  17  | }) => {
  18  |   await openPage(page, "/dk/store")
  19  |   await expect(page.getByTestId("store-page-title")).toHaveText("All products")
  20  |   const product = page
  21  |     .getByTestId("product-wrapper")
  22  |     .filter({ hasText: seed.productTitle })
  23  |   await expect(product).toHaveCount(1)
  24  |   await page
  25  |     .getByTestId("products-list")
  26  |     .getByRole("link", { name: new RegExp(seed.productTitle) })
> 27  |     .click()
      |      ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  28  |   await expect(
  29  |     page.getByTestId("product-container").getByTestId("product-title"),
  30  |   ).toHaveText(seed.productTitle)
  31  |   await expect(page.getByTestId("product-description")).not.toBeEmpty()
  32  |   expect(new URL(page.url()).pathname).toBe(`/dk/products/${seed.handle}`)
  33  | })
  34  | test("UI-002 R-INVENTORY selecting a variant updates availability and selected options", async ({
  35  |   page,
  36  |   seed,
  37  | }) => {
  38  |   await new ProductPage(page, seed).open(false)
  39  |   const size = page.getByRole("group", { name: "Select Size" })
  40  |   await size.getByTestId("option-button").filter({ hasText: /^M$/ }).click()
  41  |   await expect(
  42  |     size.getByRole("radio", { name: "M", exact: true }),
  43  |   ).toBeChecked()
  44  |   await expect(page.getByTestId("product-availability")).toHaveText("In stock")
  45  |   await expect(page.getByTestId("add-product-button")).toBeEnabled()
  46  | })
  47  | test("UI-003 R-CART product action adds exactly one unit @smoke", async ({
  48  |   page,
  49  |   seed,
  50  | }) => {
  51  |   const product = new ProductPage(page, seed)
  52  |   await product.open()
  53  |   await product.add()
  54  |   const cart = new CartPage(page)
  55  |   await cart.open()
  56  |   await expect(cart.row()).toHaveCount(1)
  57  |   await expect(page.getByTestId("product-select-button")).toHaveValue("1")
  58  |   await cart.expectTotal(seed.unitPrice)
  59  | })
  60  | test("UI-004 R-CART quantity update recalculates displayed total", async ({
  61  |   page,
  62  |   store,
  63  |   context,
  64  |   seed,
  65  | }) => {
  66  |   const cart = await store.cartWithItem()
  67  |   await setCart(context, cart.id)
  68  |   const view = new CartPage(page)
  69  |   await view.open()
  70  |   await view.quantity(3)
  71  |   await view.expectTotal(3 * seed.unitPrice)
  72  | })
  73  | test("UI-005 R-INVENTORY cart offers its documented one to ten quantity range", async ({
  74  |   page,
  75  |   store,
  76  |   context,
  77  |   seed,
  78  | }) => {
  79  |   const cart = await store.cartWithItem()
  80  |   await setCart(context, cart.id)
  81  |   const view = new CartPage(page)
  82  |   await view.open()
  83  |   const values = await page
  84  |     .getByTestId("product-select-button")
  85  |     .locator("option:not([disabled])")
  86  |     .evaluateAll((options) =>
  87  |       options.map((option) => Number((option as HTMLOptionElement).value)),
  88  |     )
  89  |   expect(Math.min(...values)).toBe(1)
  90  |   expect(Math.max(...values)).toBe(10)
  91  |   await view.quantity(10)
  92  |   await view.expectTotal(10 * seed.unitPrice)
  93  | })
  94  | test("UI-006 R-CART deleting the last item displays an empty cart", async ({
  95  |   page,
  96  |   store,
  97  |   context,
  98  | }) => {
  99  |   await setCart(context, (await store.cartWithItem()).id)
  100 |   await new CartPage(page).open()
  101 |   // Upstream DeleteButton does not forward its test id; scope its button to the item row.
  102 |   await page.getByTestId("product-row").getByRole("button").click()
  103 |   await expect(page.getByTestId("empty-cart-message")).toBeVisible()
  104 |   await expect(page.getByTestId("product-row")).toHaveCount(0)
  105 | })
  106 | test("UI-007 R-PROMO discount and final total agree with ten percent promotion @smoke", async ({
  107 |   page,
  108 |   store,
  109 |   context,
  110 |   seed,
  111 | }) => {
  112 |   await setCart(context, (await store.cartWithItem(3)).id)
  113 |   const cart = new CartPage(page)
  114 |   await cart.open()
  115 |   await cart.apply(seed.promotionCode)
  116 |   await expect(page.getByTestId("cart-discount")).toHaveAttribute(
  117 |     "data-value",
  118 |     "3",
  119 |   )
  120 |   await expect(page.getByTestId("cart-discount")).toHaveText(/^-\s*€3\.00$/)
  121 |   await cart.expectTotal(27)
  122 | })
  123 | test("UI-008 R-PROMO removing promotion restores full price", async ({
  124 |   page,
  125 |   store,
  126 |   context,
  127 |   seed,
```