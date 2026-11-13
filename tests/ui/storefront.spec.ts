import AxeBuilder from "@axe-core/playwright"
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
    .filter({ hasText: seed.productTitle })
  await expect(product).toHaveCount(1)
  await page
    .getByTestId("products-list")
    .getByRole("link", { name: new RegExp(seed.productTitle) })
    .click()
  await expect(
    page.getByTestId("product-container").getByTestId("product-title"),
  ).toHaveText(seed.productTitle)
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
  seed,
  store,
}) => {
  const catalog = await jsonOk<{ products: { title: string }[] }>(
    await store.get("/store/products?limit=100"),
  )
  const expected = catalog.products
    .filter((product) => product.title.toLowerCase().includes("t-shirt"))
    .map((product) => product.title)
    .sort()
  await openPage(page, "/dk/store")
  await page.getByTestId("store-search-input").fill("T-Shirt")
  await expect(page.getByTestId("product-wrapper")).toHaveCount(expected.length)
  expect(
    (
      await page
        .getByTestId("products-list")
        .getByTestId("product-title")
        .allTextContents()
    ).sort(),
  ).toEqual(expected)
  expect(expected).toContain(seed.productTitle)
  await page.getByTestId("store-search-clear").click()
  await expect(page.getByTestId("product-wrapper")).toHaveCount(
    catalog.products.length,
  )
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
  seed,
  store,
}) => {
  const catalog = await jsonOk<{
    products: { title: string; categories: { name: string }[] }[]
  }>(await store.get("/store/products?limit=100&fields=*categories"))
  const expected = catalog.products
    .filter((product) =>
      product.categories.some((category) => category.name === "Shirts"),
    )
    .map((product) => product.title)
    .sort()
  await openPage(page, "/dk/store")
  const toggle = page.getByTestId("filters-toggle")
  if (await toggle.isVisible()) await toggle.click()
  const filter = page
    .getByTestId("refinement-category")
    .locator("..")
    .filter({ hasText: /^Shirts/ })
  await filter.getByRole("checkbox").check()
  await expect(page.getByTestId("product-wrapper")).toHaveCount(expected.length)
  expect(
    (
      await page
        .getByTestId("products-list")
        .getByTestId("product-title")
        .allTextContents()
    ).sort(),
  ).toEqual(expected)
  expect(expected).toContain(seed.productTitle)
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
  // Next.js can temporarily retain an extra editor inside a hidden streaming
  // fragment. Require one active editor rather than selecting an arbitrary copy.
  const editor = page
    .getByTestId("account-name-editor")
    .filter({ visible: true })
  await expect(editor).toHaveCount(1)
  const edit = editor.getByRole("button", { name: "Edit", exact: true })
  await edit.focus()
  await page.keyboard.press("Enter")
  await expect(editor.getByTestId("first-name-input")).toHaveAccessibleName(
    /^First name\s*\*$/,
  )
  await editor.getByTestId("first-name-input").fill("Updated")
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze()
  expect(accessibility.violations).toEqual([])
  await editor
    .getByRole("button", { name: "Save changes", exact: true })
    .focus()
  await page.keyboard.press("Enter")
  await expect(edit).toBeFocused()
  await expect(editor.getByTestId("current-info")).toContainText("Updated")
  await page.reload({ waitUntil: "domcontentloaded" })
  await expect(editor.getByTestId("current-info")).toContainText("Updated")
})
test("UI-017 R-ORDER customer completes checkout and sees order history @smoke", async ({
  page,
  seed,
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
  await expect(page.getByTestId("order-card")).toContainText(seed.productTitle)
})

test("UI-018 R-DESIGN homepage uses working local imagery and real catalog links @smoke", async ({
  page,
  seed,
}) => {
  await openPage(page, "/dk")
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Everyday,",
  )
  await expect(
    page.getByTestId("home-products").getByTestId("product-wrapper"),
  ).toHaveCount(4)
  const images = page.getByTestId("home-products").locator("img")
  await images.first().scrollIntoViewIfNeeded()
  await expect
    .poll(() =>
      images.evaluateAll((images) =>
        images.every(
          (image) =>
            (image as HTMLImageElement).complete &&
            (image as HTMLImageElement).naturalWidth > 0,
        ),
      ),
    )
    .toBe(true)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(await page.evaluate(() => innerWidth))
  await page
    .getByTestId("home-products")
    .getByRole("link")
    .filter({ hasText: seed.productTitle })
    .click()
  await expect(
    page.getByTestId("product-container").getByTestId("product-title"),
  ).toHaveText(seed.productTitle)
})

test("UI-019 R-DESIGN keyboard skip link and responsive shopping navigation work", async ({
  page,
  store,
}) => {
  const catalog = await jsonOk<{ count: number }>(
    await store.get("/store/products?limit=1"),
  )
  await openPage(page, "/dk")
  // Native WebKit tab-navigation preferences vary by platform; verify keyboard
  // activation and main-content focus transfer consistently in all engines.
  await page.getByRole("link", { name: "Skip to content" }).focus()
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(page.locator("#main-content")).toBeFocused()
  await expect(page.getByRole("main")).toHaveCount(1)
  await expect(
    page.getByRole("main").getByRole("navigation", { name: "Main navigation" }),
  ).toHaveCount(0)
  const menu = page.getByTestId("nav-menu-button")
  if (await menu.isVisible()) {
    await menu.click()
    await expect(page.getByTestId("nav-menu-popup")).toBeVisible()
    await page.getByTestId("nav-menu-popup").getByTestId("store-link").click()
  } else await page.getByTestId("home-shop-button").click()
  await expect(page.getByTestId("store-page-title")).toHaveText("All products")
  await expect(page.getByTestId("product-wrapper")).toHaveCount(
    Math.min(catalog.count, 12),
  )
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(await page.evaluate(() => innerWidth))
  await page.getByTestId("nav-account-link").click()
  await expect(page.getByTestId("login-page")).toBeVisible()
})

test("UI-020 R-CATALOG selected color displays the matching variant photograph", async ({
  page,
  seed,
}) => {
  await new ProductPage(page, seed).open()
  const color = page.getByRole("group", { name: "Select Color" })
  await color
    .getByTestId("option-button")
    .filter({ hasText: /^White$/ })
    .click()
  await expect(
    page.locator(".forme-gallery-image img").first(),
  ).toHaveAttribute("src", /tee-white/)
  await expect(
    color.getByRole("radio", { name: "White", exact: true }),
  ).toBeChecked()
  await color
    .getByTestId("option-button")
    .filter({ hasText: /^Black$/ })
    .click()
  await expect(
    page.locator(".forme-gallery-image img").first(),
  ).toHaveAttribute("src", /tee\.webp/)
})
