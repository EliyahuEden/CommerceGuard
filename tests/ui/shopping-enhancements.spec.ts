import AxeBuilder from "@axe-core/playwright"
import { test, expect } from "../../src/fixtures/test.js"
import { jsonOk } from "../../src/api/store-client.js"
import { openPage, setCart, setCustomer } from "../../src/pages/storefront.js"

test("UI-021 R-WISHLIST guest can save, reload and remove a product @smoke", async ({
  page,
  seed,
}) => {
  await openPage(page, `/dk/products/${seed.handle}`)
  await page
    .getByRole("button", { name: `Save ${seed.productTitle} to wishlist` })
    .click()
  await page.getByRole("link", { name: "Wishlist", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: seed.productTitle, exact: true }),
  ).toBeVisible()
  await expect(page).toHaveURL(/\/wishlist$/)
  await page.reload()
  await page
    .getByRole("button", { name: `Remove ${seed.productTitle} from wishlist` })
    .click()
  await expect(
    page.getByRole("heading", { name: "Something will catch your eye." }),
  ).toBeVisible()
})

test("UI-022 R-WISHLIST guest selection merges after real login and survives in an independent session", async ({
  page,
  context,
  browser,
  store,
  seed,
}) => {
  const user = await store.customer()
  const { products } = await jsonOk<{ products: { id: string }[] }>(
    await store.get("/store/products?handle=sage-tee"),
  )
  await jsonOk(
    await user.client.post("/store/customers/me", {
      metadata: { forme_wishlist: [products[0].id] },
    }),
  )
  await openPage(page, `/dk/products/${seed.handle}`)
  await page
    .getByRole("button", { name: `Save ${seed.productTitle} to wishlist` })
    .click()
  await page.getByTestId("nav-account-link").click()
  await page.getByRole("main").getByTestId("email-input").fill(user.email)
  await page.getByRole("main").getByTestId("password-input").fill(user.password)
  await page.getByRole("main").getByTestId("sign-in-button").click()
  await expect
    .poll(async () => {
      const result = await jsonOk<{
        customer: { metadata: { forme_wishlist?: string[] } }
      }>(await user.client.get("/store/customers/me"))
      return result.customer.metadata.forme_wishlist?.sort()
    })
    .toEqual([seed.productId, products[0].id].sort())
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("forme.guest-wishlist.v1")),
    )
    .toBeNull()
  const independent = await browser.newContext()
  try {
    await setCustomer(independent, user.token)
    const tab = await independent.newPage()
    await openPage(tab, "/dk/wishlist")
    await expect(
      tab.getByRole("heading", { name: seed.productTitle, exact: true }),
    ).toBeVisible()
    await expect(
      tab.getByRole("heading", { name: "Sage Cotton T-Shirt", exact: true }),
    ).toBeVisible()
  } finally {
    await independent.close()
  }
  await context.clearCookies()
  await openPage(page, "/dk/wishlist")
  await expect(
    page.getByRole("heading", { name: "Something will catch your eye." }),
  ).toBeVisible()
})

test("UI-023 R-DESIGN size guide and image zoom support keyboard dismissal and restore focus", async ({
  page,
  seed,
}) => {
  await openPage(page, `/dk/products/${seed.handle}`)
  const size = page.getByRole("button", { name: "Find your size" })
  await size.focus()
  await page.keyboard.press("Enter")
  const guide = page.getByRole("dialog", { name: "Size guide", exact: true })
  await expect(guide).toBeVisible()
  await expect(guide.getByRole("table")).toContainText("Chest")
  await expect(
    guide.getByRole("button", { name: "Close Size guide" }),
  ).toBeFocused()
  await page.keyboard.press("Tab")
  const trapped = await guide.evaluate((dialog) =>
    dialog.contains(document.activeElement),
  )
  expect(trapped).toBe(true)
  await page.keyboard.press("Escape")
  await expect(guide).not.toBeVisible()
  await expect(size).toBeFocused()
  const zoom = page.getByRole("button", { name: "Zoom image" }).first()
  await zoom.focus()
  await page.keyboard.press("Enter")
  await expect(
    page.getByRole("dialog", { name: "Product image 1", exact: true }),
  ).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(zoom).toBeFocused()
})

test("UI-024 R-CHECKOUT invalid address announces fields and preserves typed values on mobile and desktop @smoke", async ({
  page,
  context,
  store,
}) => {
  const cart = await store.cartWithItem()
  await setCart(context, cart.id)
  await openPage(page, "/dk/checkout?step=address")
  await expect(
    page.getByRole("navigation", { name: "Checkout progress" }),
  ).toContainText("Address")
  const first = page.getByRole("main").getByTestId("shipping-first-name-input")
  await first.fill("Retained")
  await page
    .getByRole("main")
    .getByTestId("shipping-email-input")
    .fill("not-an-email")
  await page.getByRole("main").getByTestId("submit-address-button").click()
  await expect(
    page.getByRole("main").getByTestId("address-error-message"),
  ).toContainText("Your details have been kept")
  await expect(first).toHaveValue("Retained")
  await expect(
    page.getByRole("main").getByTestId("shipping-email-input"),
  ).toHaveAttribute("aria-invalid", "true")
  await expect(
    page.getByRole("main").getByTestId("shipping-last-name-input"),
  ).toBeFocused()
  if (page.viewportSize()!.width < 768) {
    const a = await first.boundingBox()
    const b = await page
      .getByRole("main")
      .getByTestId("shipping-last-name-input")
      .boundingBox()
    expect(b!.y).toBeGreaterThanOrEqual(a!.y + a!.height)
  }
  expect((await store.cart(cart.id)).items[0].quantity).toBe(1)
})

test("UI-025 R-ORDER status reflects the order and buy again uses a fresh cart without duplicating orders", async ({
  page,
  context,
  store,
  seed,
}) => {
  const user = await store.customer()
  const cart = await user.client.cartWithItem(2)
  await user.client.readyForCheckout(cart.id, user.email)
  const order = await user.client.complete(cart.id)
  const current = await jsonOk<{
    order: { fulfillment_status: string; payment_status: string }
  }>(await user.client.get(`/store/orders/${order.id}`))
  await setCustomer(context, user.token)
  await openPage(page, `/dk/account/orders/details/${order.id}`)
  await expect(
    page.getByRole("main").getByTestId("order-fulfillment-status"),
  ).toHaveText(current.order.fulfillment_status.replaceAll("_", " "))
  await expect(
    page.getByRole("main").getByTestId("order-payment-status"),
  ).toHaveText(current.order.payment_status.replaceAll("_", " "))
  await page.getByRole("button", { name: "Buy again" }).click()
  await expect(page).toHaveURL(/\/cart$/)
  const cookie = (await context.cookies()).find(
    (value) => value.name === "_medusa_cart_id",
  )!
  expect(cookie.value).not.toBe(cart.id)
  const fresh = await user.client.cart(cookie.value)
  expect(fresh.items).toHaveLength(1)
  expect(fresh.items[0]).toMatchObject({
    variant_id: seed.variantId,
    quantity: 2,
    unit_price: seed.unitPrice,
  })
  const history = await jsonOk<{ count: number }>(
    await user.client.get("/store/orders"),
  )
  expect(history.count).toBe(1)
})

test("UI-026 R-INVENTORY unavailable hoodie size blocks purchase and available size restores it", async ({
  page,
}) => {
  await openPage(page, "/dk/products/charcoal-hoodie")
  await page
    .getByRole("main")
    .getByTestId("option-button")
    .filter({ hasText: /^XL$/ })
    .click()
  await page
    .getByRole("main")
    .getByTestId("option-button")
    .filter({ hasText: /^Charcoal$/ })
    .click()
  await expect(
    page.getByRole("main").getByTestId("product-availability"),
  ).toHaveText("Out of stock")
  await expect(
    page.getByRole("main").getByTestId("add-product-button"),
  ).toBeDisabled()
  await page
    .getByRole("main")
    .getByTestId("option-button")
    .filter({ hasText: /^M$/ })
    .click()
  await expect(
    page.getByRole("main").getByTestId("product-availability"),
  ).toHaveText("In stock")
  await expect(
    page.getByRole("main").getByTestId("add-product-button"),
  ).toBeEnabled()
})

test("UI-028 R-ACCESS another customer's account order page exposes no order details @smoke", async ({
  page,
  context,
  store,
}) => {
  const owner = await store.customer()
  const other = await store.customer()
  const cart = await owner.client.cartWithItem()
  await owner.client.readyForCheckout(cart.id, owner.email)
  const order = await owner.client.complete(cart.id)
  await setCustomer(context, other.token)
  await openPage(page, `/dk/account/orders/details/${order.id}`)
  await expect(page.getByTestId("order-details-container")).toHaveCount(0)
  await expect(page.getByText(owner.email, { exact: true })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Buy again" })).toHaveCount(0)
  await expect(page.getByRole("heading", { name: /not found/i })).toBeVisible()
})

test("UI-027 R-A11Y key shopping routes pass scoped WCAG automated checks", async ({
  page,
  context,
  store,
  seed,
}, testInfo) => {
  test.setTimeout(180_000)
  await page.emulateMedia({ reducedMotion: "reduce" })
  const cart = await store.cartWithItem()
  await setCart(context, cart.id)
  for (const path of [
    "/dk",
    "/dk/store",
    `/dk/products/${seed.handle}`,
    "/dk/account",
    "/dk/wishlist",
    "/dk/collections/considered-layers",
    "/dk/cart",
    "/dk/checkout?step=address",
  ]) {
    await openPage(page, path)
    await page.evaluate(async () => {
      const finite = document
        .getAnimations()
        .filter(
          (animation) =>
            animation.effect?.getComputedTiming().iterations !== Infinity,
        )
      await Promise.all(
        finite.map((animation) => animation.finished.catch(() => undefined)),
      )
    })
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze()
    await testInfo.attach(`accessibility-${encodeURIComponent(path)}.json`, {
      body: JSON.stringify(result, null, 2),
      contentType: "application/json",
    })
    expect(
      result.violations,
      `${path}: ${JSON.stringify(result.violations.map((value) => ({ id: value.id, nodes: value.nodes.map((node) => node.target) })))}`,
    ).toEqual([])
  }
})
