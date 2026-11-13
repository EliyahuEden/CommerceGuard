# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: integration\consistency.spec.ts >> INT-001 R-CART UI quantity API totals and SQL line records agree @smoke
- Location: tests\integration\consistency.spec.ts:5:1

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  getByTestId('product-select-button')
Expected: "3"
Received: "1"
Timeout:  15000ms

Call log:
  - Expect "toHaveValue" getByTestId('product-select-button') with timeout 15000ms
  - waiting for getByTestId('product-select-button')
    33 × locator resolved to <select data-testid="product-select-button" class="appearance-none bg-transparent border-none px-4 transition-colors duration-150 focus:border-gray-700 outline-none w-16 h-16 items-center justify-center">…</select>
       - unexpected value "1"

```

```yaml
- combobox:
  - option "Select..." [disabled]
  - option "1" [selected]
  - option "2"
  - option "3"
  - option "4"
  - option "5"
  - option "6"
  - option "7"
  - option "8"
  - option "9"
  - option "10"
  - option "1"
```

# Test source

```ts
  1   | import { expect, type BrowserContext, type Page } from "@playwright/test"
  2   | import { env, type Seed } from "../config.js"
  3   | 
  4   | export async function openPage(page: Page, path: string) {
  5   |   await page.goto(path, { waitUntil: "domcontentloaded" })
  6   |   // Explicit AUT test hook emitted by a React effect after hydration starts.
  7   |   // Avoid lost interactions with SSR controls and dependence on remote image load.
  8   |   await page.waitForFunction(
  9   |     () => document.documentElement.dataset.commerceguardHydrated === "true",
  10  |   )
  11  | }
  12  | 
  13  | export async function setCart(context: BrowserContext, id: string) {
  14  |   await context.addCookies([
  15  |     {
  16  |       name: "_medusa_cart_id",
  17  |       value: id,
  18  |       url: env.BASE_URL,
  19  |       httpOnly: true,
  20  |       sameSite: "Lax",
  21  |     },
  22  |   ])
  23  | }
  24  | export async function setCustomer(context: BrowserContext, token: string) {
  25  |   await context.addCookies([
  26  |     {
  27  |       name: "_medusa_jwt",
  28  |       value: token,
  29  |       url: env.BASE_URL,
  30  |       httpOnly: true,
  31  |       sameSite: "Lax",
  32  |     },
  33  |   ])
  34  | }
  35  | export class ProductPage {
  36  |   constructor(
  37  |     readonly page: Page,
  38  |     readonly seed: Seed,
  39  |   ) {}
  40  |   async open(selected = true) {
  41  |     await openPage(
  42  |       this.page,
  43  |       `/dk/products/${this.seed.handle}${selected ? `?v_id=${this.seed.variantId}` : ""}`,
  44  |     )
  45  |     await expect(this.page.getByTestId("product-container")).toBeVisible()
  46  |   }
  47  |   async add() {
  48  |     const button = this.page.getByTestId("add-product-button")
  49  |     await expect(button).toBeEnabled()
  50  |     await button.click()
  51  |     await expect(button).toBeEnabled()
  52  |     await expect(this.page.getByTestId("nav-cart-link")).toContainText("(1)")
  53  |   }
  54  | }
  55  | export class CartPage {
  56  |   constructor(readonly page: Page) {}
  57  |   async open() {
  58  |     await openPage(this.page, "/dk/cart")
  59  |   }
  60  |   row() {
  61  |     return this.page.getByTestId("product-row")
  62  |   }
  63  |   async expectTotal(total: number) {
  64  |     await expect(this.page.getByTestId("cart-total")).toHaveAttribute(
  65  |       "data-value",
  66  |       String(total),
  67  |     )
  68  |     await expect(this.page.getByTestId("cart-total")).toHaveText(
  69  |       new Intl.NumberFormat("en-US", {
  70  |         style: "currency",
  71  |         currency: "EUR",
  72  |       }).format(total),
  73  |     )
  74  |   }
  75  |   async quantity(value: number) {
  76  |     await this.page
  77  |       .getByTestId("product-select-button")
  78  |       .selectOption(String(value))
  79  |     await expect(this.page.getByTestId("product-select-button")).toBeEnabled()
> 80  |     await expect(this.page.getByTestId("product-select-button")).toHaveValue(
      |                                                                  ^ Error: expect(locator).toHaveValue(expected) failed
  81  |       String(value),
  82  |     )
  83  |   }
  84  |   async apply(code: string) {
  85  |     await this.page.getByTestId("add-discount-button").click()
  86  |     await this.page.getByTestId("discount-input").fill(code)
  87  |     await this.page.getByTestId("discount-apply-button").click()
  88  |     await expect(this.page.getByTestId("discount-code")).toContainText(code)
  89  |   }
  90  | }
  91  | export class AccountPage {
  92  |   constructor(readonly page: Page) {}
  93  |   async open() {
  94  |     await openPage(this.page, "/dk/account")
  95  |   }
  96  |   async login(email: string, password: string) {
  97  |     await this.page.getByTestId("email-input").fill(email)
  98  |     await this.page.getByTestId("password-input").fill(password)
  99  |     await this.page.getByTestId("sign-in-button").click()
  100 |   }
  101 | }
  102 | export class CheckoutPage {
  103 |   constructor(readonly page: Page) {}
  104 |   async address(email: string) {
  105 |     await this.page.getByTestId("shipping-first-name-input").fill("Commerce")
  106 |     await this.page.getByTestId("shipping-last-name-input").fill("Guard")
  107 |     await this.page.getByTestId("shipping-address-input").fill("Test Street 42")
  108 |     await this.page.getByTestId("shipping-postal-code-input").fill("2100")
  109 |     await this.page.getByTestId("shipping-city-input").fill("Copenhagen")
  110 |     await this.page.getByTestId("shipping-country-select").selectOption("dk")
  111 |     await this.page.getByTestId("shipping-email-input").fill(email)
  112 |     await this.page.getByTestId("shipping-phone-input").fill("+4512345678")
  113 |     await this.page.getByTestId("submit-address-button").click()
  114 |   }
  115 |   async deliveryAndPayment() {
  116 |     await this.page
  117 |       .getByTestId("delivery-option-radio")
  118 |       .filter({ hasText: "Standard Shipping" })
  119 |       .click()
  120 |     await this.page.getByTestId("submit-delivery-option-button").click()
  121 |     await this.page
  122 |       .getByRole("radio")
  123 |       .filter({ hasText: /manual|test/i })
  124 |       .click()
  125 |     await this.page.getByTestId("submit-payment-button").click()
  126 |     await expect(this.page.getByTestId("submit-order-button")).toBeEnabled()
  127 |   }
  128 |   async placeOrder() {
  129 |     await this.page.getByTestId("submit-order-button").click()
  130 |     await expect(this.page).toHaveURL(/\/order\/.*\/confirmed/)
  131 |     await expect(
  132 |       this.page.getByTestId("order-complete-container"),
  133 |     ).toBeVisible()
  134 |   }
  135 | }
  136 | 
```