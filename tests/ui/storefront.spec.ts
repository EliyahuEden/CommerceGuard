import { test, expect } from "../../src/fixtures/test.js"
import {
  ProductPage,
  CartPage,
  AccountPage,
  CheckoutPage,
  setCart,
  setCustomer,
  openPage,
} from "../../src/pages/storefront.js"
import { customerData } from "../../src/data/factories.js"
import { jsonOk } from "../../src/api/store-client.js"

test("UI-001 R-CATALOG product browsing and details show the seeded product @smoke", async ({
  page,
  seed,
}) => {
  await openPage(page, "/dk/store")
  await expect(page.getByTestId("store-page-title")).toHaveText("All products")
  const product = page
    .getByTestId("product-wrapper")
    .filter({ hasText: "Medusa T-Shirt" })
  await expect(product).toHaveCount(1)
  await page
    .getByTestId("products-list")
    .getByRole("link", { name: /Medusa T-Shirt/ })
    .click()
  await expect(
    page.getByTestId("product-container").getByTestId("product-title"),
  ).toHaveText("Medusa T-Shirt")
  await expect(page.getByTestId("product-description")).not.toBeEmpty()
  expect(new URL(page.url()).pathname).toBe(`/dk/products/${seed.handle}`)
})
test("UI-002 R-INVENTORY selecting a variant updates availability and selected options", async ({
  page,
  seed,
}) => {
  await new ProductPage(page, seed).open(false)
  const size = page.getByRole("group", { name: "Select Size" })
  await size.getByTestId("option-button").filter({ hasText: /^M$/ }).click()
  await expect(
    size.getByRole("radio", { name: "M", exact: true }),
  ).toBeChecked()
  await expect(page.getByTestId("product-availability")).toHaveText("In stock")
  await expect(page.getByTestId("add-product-button")).toBeEnabled()
})
test("UI-003 R-CART product action adds exactly one unit @smoke", async ({
  page,
  seed,
}) => {
  const product = new ProductPage(page, seed)
  await product.open()
  await product.add()
  const cart = new CartPage(page)
  await cart.open()
  await expect(cart.row()).toHaveCount(1)
  await expect(page.getByTestId("product-select-button")).toHaveValue("1")
  await cart.expectTotal(seed.unitPrice)
})
test("UI-004 R-CART quantity update recalculates displayed total", async ({
  page,
  store,
  context,
  seed,
}) => {
  const cart = await store.cartWithItem()
  await setCart(context, cart.id)
  const view = new CartPage(page)
  await view.open()
  await view.quantity(3)
  await view.expectTotal(3 * seed.unitPrice)
})
test("UI-005 R-INVENTORY cart offers its documented one to ten quantity range", async ({
  page,
  store,
  context,
  seed,
}) => {
  const cart = await store.cartWithItem()
  await setCart(context, cart.id)
  const view = new CartPage(page)
  await view.open()
  const values = await page
    .getByTestId("product-select-button")
    .locator("option:not([disabled])")
    .evaluateAll((options) =>
      options.map((option) => Number((option as HTMLOptionElement).value)),
    )
  expect(Math.min(...values)).toBe(1)
  expect(Math.max(...values)).toBe(10)
  await view.quantity(10)
  await view.expectTotal(10 * seed.unitPrice)
})
test("UI-006 R-CART deleting the last item displays an empty cart", async ({
  page,
  store,
  context,
}) => {
  await setCart(context, (await store.cartWithItem()).id)
  await new CartPage(page).open()
  // Upstream DeleteButton does not forward its test id; scope its button to the item row.
  await page.getByTestId("product-row").getByRole("button").click()
  await expect(page.getByTestId("empty-cart-message")).toBeVisible()
  await expect(page.getByTestId("product-row")).toHaveCount(0)
})
test("UI-007 R-PROMO discount and final total agree with ten percent promotion @smoke", async ({
  page,
  store,
  context,
  seed,
}) => {
  await setCart(context, (await store.cartWithItem(3)).id)
  const cart = new CartPage(page)
  await cart.open()
  await cart.apply(seed.promotionCode)
  await expect(page.getByTestId("cart-discount")).toHaveAttribute(
    "data-value",
    "3",
  )
  await expect(page.getByTestId("cart-discount")).toHaveText(/^-\s*€3\.00$/)
  await cart.expectTotal(27)
})
test("UI-008 R-PROMO removing promotion restores full price", async ({
  page,
  store,
  context,
  seed,
}) => {
  const cart = await store.cartWithItem()
  await jsonOk(
    await store.post(`/store/carts/${cart.id}/promotions`, {
      promo_codes: [seed.promotionCode],
    }),
  )
  await setCart(context, cart.id)
  const view = new CartPage(page)
  await view.open()
  await page.getByTestId("remove-discount-button").click()
  await expect(page.getByTestId("cart-discount")).toHaveCount(0)
  await view.expectTotal(seed.unitPrice)
})
test("UI-009 R-CATALOG search narrows products and can be cleared", async ({
  page,
}) => {
  await openPage(page, "/dk/store")
  await page.getByTestId("store-search-input").fill("T-Shirt")
  await expect(page.getByTestId("product-wrapper")).toHaveCount(1)
  await expect(page.getByTestId("product-wrapper")).toContainText(
    "Medusa T-Shirt",
  )
  await page.getByTestId("store-search-clear").click()
  await expect(page.getByTestId("product-wrapper")).toHaveCount(4)
})
test("UI-010 R-ERROR search with no matching product shows empty state", async ({
  page,
}) => {
  await openPage(page, "/dk/store")
  await page
    .getByTestId("store-search-input")
    .fill("cg-impossible-product-98765")
  await expect(page.getByTestId("no-products")).toBeVisible()
  await expect(page.getByTestId("product-wrapper")).toHaveCount(0)
})
test("UI-011 R-CATALOG category filter restricts the catalog", async ({
  page,
}) => {
  await openPage(page, "/dk/store")
  const filter = page
    .getByTestId("refinement-category")
    .locator("..")
    .filter({ hasText: /^Shirts/ })
  await filter.getByRole("checkbox").check()
  await expect(page.getByTestId("product-wrapper")).toHaveCount(1)
  await expect(page.getByTestId("product-wrapper")).toContainText(
    "Medusa T-Shirt",
  )
})
test("UI-012 R-AUTH registration creates a usable customer account", async ({
  page,
}) => {
  const data = customerData()
  const account = new AccountPage(page)
  await account.open()
  await page.getByTestId("register-button").click()
  await page.getByTestId("first-name-input").fill(data.first_name)
  await page.getByTestId("last-name-input").fill(data.last_name)
  await page.getByTestId("email-input").fill(data.email)
  await page.getByTestId("password-input").fill(data.password)
  await page.getByTestId("register-button").click()
  await expect(page.getByTestId("welcome-message")).toContainText(
    data.first_name,
  )
  await expect(page.getByTestId("customer-email")).toHaveText(data.email)
})
test("UI-013 R-AUTH invalid login displays a useful error @smoke", async ({
  page,
}) => {
  const account = new AccountPage(page)
  await account.open()
  await account.login(customerData().email, "wrong-password")
  await expect(page.getByTestId("login-error-message")).toBeVisible()
  await expect(page.getByTestId("login-error-message")).toContainText(
    /invalid|unauthorized/i,
  )
  await expect(page.getByTestId("login-page")).toBeVisible()
})
test("UI-014 R-AUTH existing customer can log in and log out", async ({
  page,
  store,
}) => {
  const user = await store.customer()
  const account = new AccountPage(page)
  await account.open()
  await account.login(user.email, user.password)
  await expect(page.getByTestId("customer-email")).toHaveText(user.email)
  await page.getByTestId("logout-button").filter({ visible: true }).click()
  await expect(page.getByTestId("login-page")).toBeVisible()
})
test("UI-015 R-ACCESS unauthenticated profile navigation requires login", async ({
  page,
}) => {
  await openPage(page, "/dk/account/profile")
  await expect(page.getByTestId("login-page")).toBeVisible()
  await expect(page.getByTestId("account-name-editor")).toHaveCount(0)
})
test("UI-016 R-ACCOUNT name edit persists after reload", async ({
  page,
  store,
  context,
}) => {
  const user = await store.customer()
  await setCustomer(context, user.token)
  await openPage(page, "/dk/account/profile")
  const editor = page.getByTestId("account-name-editor")
  await editor.getByTestId("edit-button").click()
  await editor.getByTestId("first-name-input").fill("Updated")
  await editor.getByTestId("save-button").click()
  await expect(editor.getByTestId("current-info")).toContainText("Updated")
  await page.reload({ waitUntil: "domcontentloaded" })
  await expect(editor.getByTestId("current-info")).toContainText("Updated")
})
test("UI-017 R-ORDER customer completes checkout and sees order history @smoke", async ({
  page,
  store,
  context,
}) => {
  test.setTimeout(90_000)
  const user = await store.customer()
  const cart = await user.client.cartWithItem()
  await setCustomer(context, user.token)
  await setCart(context, cart.id)
  await openPage(page, "/dk/checkout?step=address")
  const checkout = new CheckoutPage(page)
  await checkout.address(user.email)
  await checkout.deliveryAndPayment()
  await checkout.placeOrder()
  await openPage(page, "/dk/account/orders")
  await expect(page.getByTestId("order-card")).toHaveCount(1)
  await expect(page.getByTestId("order-card")).toContainText("Medusa T-Shirt")
})
