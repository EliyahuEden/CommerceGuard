# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui\storefront.spec.ts >> UI-020 R-CATALOG selected color displays the matching variant photograph
- Location: tests\ui\storefront.spec.ts:329:1

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('group', { name: 'Select Color' }).getByRole('radio', { name: 'White', exact: true })
    - locator resolved to <input checked type="radio" value="White" class="peer sr-only" name="options[opt_01M760AJPCH4SF9KH6GMXSZHTK]" id="options-opt_01M760AJPCH4SF9KH6GMXSZHTK--White"/>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <label data-testid="option-button" for="options-opt_01M760AJPCH4SF9KH6GMXSZHTK--White" class="flex items-center justify-center cursor-pointer border-ui-border-base bg-ui-bg-subtle border text-small-regular h-10 rounded-rounded p-2 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1 peer-disabled:cursor-not-allowed hover:shadow-elevation-card-rest transition-shadow ease-in-out duration-150">White</label> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <label data-testid="option-button" for="options-opt_01M760AJPCH4SF9KH6GMXSZHTK--White" class="flex items-center justify-center cursor-pointer border-ui-border-base bg-ui-bg-subtle border text-small-regular h-10 rounded-rounded p-2 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1 peer-disabled:cursor-not-allowed hover:shadow-elevation-card-rest transition-shadow ease-in-out duration-150">White</label> intercepts pointer events
    - retrying click action
      - waiting 100ms
    27 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <label data-testid="option-button" for="options-opt_01M760AJPCH4SF9KH6GMXSZHTK--White" class="flex items-center justify-center cursor-pointer border-ui-border-base bg-ui-bg-subtle border text-small-regular h-10 rounded-rounded p-2 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1 peer-disabled:cursor-not-allowed hover:shadow-elevation-card-rest transition-shadow ease-in-out duration-150">White</label> intercepts pointer events
     - retrying click action
       - waiting 500ms

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
      - navigation "Breadcrumb" [ref=e29]:
        - link "The collection" [ref=e30] [cursor=pointer]:
          - /url: /dk/store
        - generic [aria-hidden] [ref=e31]: /
        - generic [ref=e32]: Essential T-Shirt
      - generic [ref=e33]:
        - generic [ref=e35]:
          - img "Product view 1" [ref=e37]
          - img "Product view 2" [ref=e39]
        - generic [ref=e40]:
          - generic [ref=e41]: THE EVERYDAY EDIT / 01
          - generic [ref=e43]:
            - heading "Essential T-Shirt" [level=1] [ref=e44]
            - paragraph [ref=e45]: An easy silhouette. A soft cotton feel. The piece you reach for, again and again. Choose your colour, find your fit, and make it part of your everyday.
          - generic [ref=e47]:
            - generic [ref=e49]:
              - group "Select Size" [ref=e51]:
                - generic [ref=e53]:
                  - generic [ref=e54]:
                    - radio "L" [ref=e55]
                    - generic [ref=e56] [cursor=pointer]: L
                  - generic [ref=e57]:
                    - radio "M" [ref=e58]
                    - generic [ref=e59] [cursor=pointer]: M
                  - generic [ref=e60]:
                    - radio "S" [checked] [ref=e61]
                    - generic [ref=e62] [cursor=pointer]: S
                  - generic [ref=e63]:
                    - radio "XL" [ref=e64]
                    - generic [ref=e65] [cursor=pointer]: XL
              - group "Select Color" [ref=e67]:
                - generic [ref=e69]:
                  - generic [ref=e70]:
                    - radio "Black" [checked] [ref=e71]
                    - generic [ref=e72] [cursor=pointer]: Black
                  - generic [ref=e73]:
                    - radio "White" [ref=e74]
                    - generic [ref=e75] [cursor=pointer]: White
            - generic [ref=e77]: €10.00
            - paragraph [ref=e79]: In stock
            - button "Add to cart" [ref=e80] [cursor=pointer]
          - generic [ref=e81]:
            - generic [ref=e82]: ✓Live stock availability
            - generic [ref=e83]: ✓Delivery options at checkout
          - generic [ref=e85]:
            - heading [level=3] [ref=e87]:
              - generic [ref=e89]:
                - paragraph [ref=e91]: Product Information
                - button [ref=e92] [cursor=pointer]
            - heading [level=3] [ref=e98]:
              - generic [ref=e100]:
                - paragraph [ref=e102]: Shipping & Returns
                - button [ref=e103] [cursor=pointer]
    - generic [ref=e109]:
      - generic [ref=e110]:
        - generic [ref=e111]: Related products
        - paragraph [ref=e112]: You might also want to check out these products.
      - list [ref=e113]:
        - listitem [ref=e114]:
          - link [ref=e115] [cursor=pointer]:
            - /url: /dk/products/shorts
            - article [ref=e116]:
              - generic [ref=e117]:
                - img "Weekend Shorts" [ref=e119]
                - generic [ref=e120]: THE EVERYDAY EDIT
                - generic [aria-hidden] [ref=e121]: ↗
              - generic [ref=e122]:
                - generic [ref=e123]:
                  - heading "Weekend Shorts" [level=3] [ref=e124]
                  - paragraph [ref=e125]: Take the long way home
                - paragraph [ref=e126]: €10.00
        - listitem [ref=e127]:
          - link [ref=e128] [cursor=pointer]:
            - /url: /dk/products/sweatpants
            - article [ref=e129]:
              - generic [ref=e130]:
                - img "Relaxed Sweatpants" [ref=e132]
                - generic [ref=e133]: THE EVERYDAY EDIT
                - generic [aria-hidden] [ref=e134]: ↗
              - generic [ref=e135]:
                - generic [ref=e136]:
                  - heading "Relaxed Sweatpants" [level=3] [ref=e137]
                  - paragraph [ref=e138]: Room to move
                - paragraph [ref=e139]: €10.00
        - listitem [ref=e140]:
          - link [ref=e141] [cursor=pointer]:
            - /url: /dk/products/sweatshirt
            - article [ref=e142]:
              - generic [ref=e143]:
                - img "Everyday Sweatshirt" [ref=e145]
                - generic [ref=e146]: THE EVERYDAY EDIT
                - generic [aria-hidden] [ref=e147]: ↗
              - generic [ref=e148]:
                - generic [ref=e149]:
                  - heading "Everyday Sweatshirt" [level=3] [ref=e150]
                  - paragraph [ref=e151]: Your off-duty layer
                - paragraph [ref=e152]: €10.00
    - generic [ref=e154]:
      - generic [ref=e155]:
        - generic [ref=e156]:
          - link "FORME" [ref=e157] [cursor=pointer]:
            - /url: /dk
          - paragraph [ref=e159]: For the way you move.For the everyday.
        - generic [ref=e160]:
          - generic [ref=e161]:
            - heading "The collection" [level=2] [ref=e162]
            - link "Shop all" [ref=e163] [cursor=pointer]:
              - /url: /dk/store
            - link "T-shirts" [ref=e164] [cursor=pointer]:
              - /url: /dk/categories/shirts
            - link "Sweatshirts" [ref=e165] [cursor=pointer]:
              - /url: /dk/categories/sweatshirts
            - link "Sweatpants" [ref=e166] [cursor=pointer]:
              - /url: /dk/categories/pants
          - generic [ref=e167]:
            - heading "Here to help" [level=2] [ref=e168]
            - link "My account" [ref=e169] [cursor=pointer]:
              - /url: /dk/account
            - link "Shipping" [ref=e170] [cursor=pointer]:
              - /url: /dk/shipping
            - link "Returns" [ref=e171] [cursor=pointer]:
              - /url: /dk/returns
            - link "Contact" [ref=e172] [cursor=pointer]:
              - /url: /dk/contact
          - generic [ref=e173]:
            - heading "Considered by design" [level=2] [ref=e174]
            - link "Our approach" [ref=e175] [cursor=pointer]:
              - /url: /dk/about
            - link "Privacy" [ref=e176] [cursor=pointer]:
              - /url: /dk/privacy
            - link "Terms" [ref=e177] [cursor=pointer]:
              - /url: /dk/terms
      - generic [ref=e178]:
        - generic [ref=e179]: © 2026 FORME. A CommerceGuard demonstration store.
        - generic [ref=e180]:
          - text: Powered by
          - link "Medusa" [ref=e181] [cursor=pointer]:
            - /url: https://medusajs.com
          - text: · Designed for everyday.
  - alert [ref=e182]
```

# Test source

```ts
  235 |   const user = await store.customer()
  236 |   await setCustomer(context, user.token)
  237 |   await openPage(page, "/dk/account/profile")
  238 |   const editor = page.getByTestId("account-name-editor")
  239 |   await editor.getByTestId("edit-button").click()
  240 |   await editor.getByTestId("first-name-input").fill("Updated")
  241 |   await editor.getByTestId("save-button").click()
  242 |   await expect(editor.getByTestId("current-info")).toContainText("Updated")
  243 |   await page.reload({ waitUntil: "domcontentloaded" })
  244 |   await expect(editor.getByTestId("current-info")).toContainText("Updated")
  245 | })
  246 | test("UI-017 R-ORDER customer completes checkout and sees order history @smoke", async ({
  247 |   page,
  248 |   seed,
  249 |   store,
  250 |   context,
  251 | }) => {
  252 |   test.setTimeout(90_000)
  253 |   const user = await store.customer()
  254 |   const cart = await user.client.cartWithItem()
  255 |   await setCustomer(context, user.token)
  256 |   await setCart(context, cart.id)
  257 |   await openPage(page, "/dk/checkout?step=address")
  258 |   const checkout = new CheckoutPage(page)
  259 |   await checkout.address(user.email)
  260 |   await checkout.deliveryAndPayment()
  261 |   await checkout.placeOrder()
  262 |   await openPage(page, "/dk/account/orders")
  263 |   await expect(page.getByTestId("order-card")).toHaveCount(1)
  264 |   await expect(page.getByTestId("order-card")).toContainText(seed.productTitle)
  265 | })
  266 | 
  267 | test("UI-018 R-DESIGN homepage uses working local imagery and real catalog links @smoke", async ({
  268 |   page,
  269 |   seed,
  270 | }) => {
  271 |   await openPage(page, "/dk")
  272 |   await expect(page.getByRole("heading", { level: 1 })).toContainText(
  273 |     "Everyday,",
  274 |   )
  275 |   await expect(
  276 |     page.getByTestId("home-products").getByTestId("product-wrapper"),
  277 |   ).toHaveCount(4)
  278 |   const images = page.getByTestId("home-products").locator("img")
  279 |   await images.first().scrollIntoViewIfNeeded()
  280 |   await expect
  281 |     .poll(() =>
  282 |       images.evaluateAll((images) =>
  283 |         images.every(
  284 |           (image) =>
  285 |             (image as HTMLImageElement).complete &&
  286 |             (image as HTMLImageElement).naturalWidth > 0,
  287 |         ),
  288 |       ),
  289 |     )
  290 |     .toBe(true)
  291 |   expect(
  292 |     await page.evaluate(() => document.documentElement.scrollWidth),
  293 |   ).toBeLessThanOrEqual(await page.evaluate(() => innerWidth))
  294 |   await page
  295 |     .getByTestId("home-products")
  296 |     .getByRole("link")
  297 |     .filter({ hasText: seed.productTitle })
  298 |     .click()
  299 |   await expect(
  300 |     page.getByTestId("product-container").getByTestId("product-title"),
  301 |   ).toHaveText(seed.productTitle)
  302 | })
  303 | 
  304 | test("UI-019 R-DESIGN keyboard skip link and responsive shopping navigation work", async ({
  305 |   page,
  306 | }) => {
  307 |   await openPage(page, "/dk")
  308 |   await page.keyboard.press("Tab")
  309 |   await expect(
  310 |     page.getByRole("link", { name: "Skip to content" }),
  311 |   ).toBeFocused()
  312 |   await page.keyboard.press("Enter")
  313 |   await expect(page.locator("#main-content")).toBeFocused()
  314 |     const menu = page.getByTestId("nav-menu-button")
  315 |     if (await menu.isVisible()) {
  316 |       await menu.click()
  317 |       await expect(page.getByTestId("nav-menu-popup")).toBeVisible()
  318 |       await page.getByTestId("nav-menu-popup").getByTestId("store-link").click()
  319 |     } else await page.getByTestId("home-shop-button").click()
  320 |   await expect(page.getByTestId("store-page-title")).toHaveText("All products")
  321 |   await expect(page.getByTestId("product-wrapper")).toHaveCount(4)
  322 |   expect(
  323 |     await page.evaluate(() => document.documentElement.scrollWidth),
  324 |   ).toBeLessThanOrEqual(await page.evaluate(() => innerWidth))
  325 |   await page.getByTestId("nav-account-link").click()
  326 |   await expect(page.getByTestId("login-page")).toBeVisible()
  327 | })
  328 | 
  329 | test("UI-020 R-CATALOG selected color displays the matching variant photograph", async ({
  330 |   page,
  331 |   seed,
  332 | }) => {
  333 |   await new ProductPage(page, seed).open()
  334 |   const color = page.getByRole("group", { name: "Select Color" })
> 335 |   await color.getByRole("radio", { name: "White", exact: true }).click()
      |                                                                  ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  336 |   await expect(
  337 |     page.locator(".forme-gallery-image img").first(),
  338 |   ).toHaveAttribute("src", /tee-white/)
  339 |   await expect(
  340 |     color.getByRole("radio", { name: "White", exact: true }),
  341 |   ).toBeChecked()
  342 |   await color.getByRole("radio", { name: "Black", exact: true }).click()
  343 |   await expect(
  344 |     page.locator(".forme-gallery-image img").first(),
  345 |   ).toHaveAttribute("src", /tee\.webp/)
  346 | })
  347 | 
```