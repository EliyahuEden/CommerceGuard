# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui\storefront.spec.ts >> UI-001 R-CATALOG product browsing and details show the seeded product @smoke
- Location: tests\ui\storefront.spec.ts:14:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByTestId('product-wrapper').filter({ hasText: 'Essential T-Shirt' })
Expected: 1
Received: 0
Timeout:  15000ms

Call log:
  - Expect "toHaveCount" getByTestId('product-wrapper').filter({ hasText: 'Essential T-Shirt' }) with timeout 15000ms
  - waiting for getByTestId('product-wrapper').filter({ hasText: 'Essential T-Shirt' })
    33 × locator resolved to 0 elements
       - unexpected value "0"

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
              - paragraph [ref=e38]: Sort by
              - generic [ref=e39]:
                - generic [ref=e40]: Relevance
                - generic [ref=e44]: Latest Arrivals
                - generic [ref=e46]: "Price: Low -> High"
                - generic [ref=e48]: "Price: High -> Low"
                - generic [ref=e50]: "Title: A -> Z"
                - generic [ref=e52]: "Title: Z -> A"
        - generic [ref=e54]:
          - searchbox "Search products" [ref=e58]
          - list [ref=e59]:
            - listitem [ref=e60]
            - listitem [ref=e66]
            - listitem [ref=e72]
            - listitem [ref=e78]
            - listitem [ref=e84]
            - listitem [ref=e90]
            - listitem [ref=e96]
            - listitem [ref=e102]
            - listitem [ref=e108]
            - listitem [ref=e114]
            - listitem [ref=e120]
            - listitem [ref=e126]
    - generic [ref=e133]:
      - generic [ref=e134]:
        - generic [ref=e135]:
          - link "FORME" [ref=e136] [cursor=pointer]:
            - /url: /dk
          - paragraph [ref=e138]: For the way you move.For the everyday.
        - generic [ref=e139]:
          - generic [ref=e140]:
            - heading "The collection" [level=2] [ref=e141]
            - link "Shop all" [ref=e142] [cursor=pointer]:
              - /url: /dk/store
            - link "T-shirts" [ref=e143] [cursor=pointer]:
              - /url: /dk/categories/shirts
            - link "Sweatshirts" [ref=e144] [cursor=pointer]:
              - /url: /dk/categories/sweatshirts
            - link "Sweatpants" [ref=e145] [cursor=pointer]:
              - /url: /dk/categories/pants
          - generic [ref=e146]:
            - heading "Here to help" [level=2] [ref=e147]
            - link "My account" [ref=e148] [cursor=pointer]:
              - /url: /dk/account
            - link "Shipping" [ref=e149] [cursor=pointer]:
              - /url: /dk/shipping
            - link "Returns" [ref=e150] [cursor=pointer]:
              - /url: /dk/returns
            - link "Contact" [ref=e151] [cursor=pointer]:
              - /url: /dk/contact
          - generic [ref=e152]:
            - heading "Considered by design" [level=2] [ref=e153]
            - link "Our approach" [ref=e154] [cursor=pointer]:
              - /url: /dk/about
            - link "Privacy" [ref=e155] [cursor=pointer]:
              - /url: /dk/privacy
            - link "Terms" [ref=e156] [cursor=pointer]:
              - /url: /dk/terms
      - generic [ref=e157]:
        - generic [ref=e158]: © 2026 FORME. A CommerceGuard demonstration store.
        - generic [ref=e159]:
          - text: Powered by
          - link "Medusa" [ref=e160] [cursor=pointer]:
            - /url: https://medusajs.com
          - text: · Designed for everyday.
  - alert [ref=e161]
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
> 23  |   await expect(product).toHaveCount(1)
      |                         ^ Error: expect(locator).toHaveCount(expected) failed
  24  |   await page
  25  |     .getByTestId("products-list")
  26  |     .getByRole("link", { name: new RegExp(seed.productTitle) })
  27  |     .click()
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
```