import { expect, type BrowserContext, type Page } from "@playwright/test"
import { env, type Seed } from "../config.js"

export async function openPage(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" })
  // Explicit AUT test hook emitted by a React effect after hydration starts.
  // Avoid lost interactions with SSR controls and dependence on remote image load.
  await page.waitForFunction(
    () => document.documentElement.dataset.commerceguardHydrated === "true",
  )
}

export async function setCart(context: BrowserContext, id: string) {
  await context.addCookies([
    {
      name: "_medusa_cart_id",
      value: id,
      url: env.BASE_URL,
      httpOnly: true,
      sameSite: "Lax",
    },
  ])
}
export async function setCustomer(context: BrowserContext, token: string) {
  await context.addCookies([
    {
      name: "_medusa_jwt",
      value: token,
      url: env.BASE_URL,
      httpOnly: true,
      sameSite: "Lax",
    },
  ])
}
export class ProductPage {
  constructor(
    readonly page: Page,
    readonly seed: Seed,
  ) {}
  async open(selected = true) {
    await openPage(
      this.page,
      `/dk/products/${this.seed.handle}${selected ? `?v_id=${this.seed.variantId}` : ""}`,
    )
    await expect(this.page.getByTestId("product-container")).toBeVisible()
  }
  async add() {
    const button = this.page.getByTestId("add-product-button")
    await expect(button).toBeEnabled()
    await button.click()
    await expect(button).toBeEnabled()
    await expect(this.page.getByTestId("nav-cart-link")).toContainText("(1)")
  }
}
export class CartPage {
  constructor(readonly page: Page) {}
  async open() {
    await openPage(this.page, "/dk/cart")
  }
  row() {
    return this.page.getByTestId("product-row")
  }
  async expectTotal(total: number) {
    await expect(this.page.getByTestId("cart-total")).toHaveAttribute(
      "data-value",
      String(total),
    )
    await expect(this.page.getByTestId("cart-total")).toHaveText(
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "EUR",
      }).format(total),
    )
  }
  async quantity(value: number) {
    await this.page
      .getByTestId("product-select-button")
      .selectOption(String(value))
    await expect(this.page.getByTestId("product-select-button")).toBeEnabled()
    await expect(this.page.getByTestId("product-select-button")).toHaveValue(
      String(value),
    )
  }
  async apply(code: string) {
    await this.page.getByTestId("add-discount-button").click()
    await this.page.getByTestId("discount-input").fill(code)
    await this.page.getByTestId("discount-apply-button").click()
    await expect(this.page.getByTestId("discount-code")).toContainText(code)
  }
}
export class AccountPage {
  constructor(readonly page: Page) {}
  async open() {
    await openPage(this.page, "/dk/account")
  }
  async login(email: string, password: string) {
    await this.page.getByTestId("email-input").fill(email)
    await this.page.getByTestId("password-input").fill(password)
    await this.page.getByTestId("sign-in-button").click()
  }
}
export class CheckoutPage {
  constructor(readonly page: Page) {}
  async address(email: string) {
    await this.page.getByTestId("shipping-first-name-input").fill("Commerce")
    await this.page.getByTestId("shipping-last-name-input").fill("Guard")
    await this.page.getByTestId("shipping-address-input").fill("Test Street 42")
    await this.page.getByTestId("shipping-postal-code-input").fill("2100")
    await this.page.getByTestId("shipping-city-input").fill("Copenhagen")
    await this.page.getByTestId("shipping-country-select").selectOption("dk")
    await this.page.getByTestId("shipping-email-input").fill(email)
    await this.page.getByTestId("shipping-phone-input").fill("+4512345678")
    await this.page.getByTestId("submit-address-button").click()
  }
  async deliveryAndPayment() {
    await this.page
      .getByTestId("delivery-option-radio")
      .filter({ hasText: "Standard Shipping" })
      .click()
    await this.page.getByTestId("submit-delivery-option-button").click()
    await this.page
      .getByRole("radio")
      .filter({ hasText: /manual|test/i })
      .click()
    await this.page.getByTestId("submit-payment-button").click()
    await expect(this.page.getByTestId("submit-order-button")).toBeEnabled()
  }
  async placeOrder() {
    await this.page.getByTestId("submit-order-button").click()
    await expect(this.page).toHaveURL(/\/order\/.*\/confirmed/)
    await expect(
      this.page.getByTestId("order-complete-container"),
    ).toBeVisible()
  }
}
