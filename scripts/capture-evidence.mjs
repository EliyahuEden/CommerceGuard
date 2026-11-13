import { chromium, expect as baseExpect } from "@playwright/test"
import { readFileSync, mkdirSync } from "node:fs"
import { resolve } from "node:path"
import { root } from "./lib.mjs"
const expect = baseExpect.configure({ timeout: 15_000 })

const seed = JSON.parse(
  readFileSync(resolve(root, ".runtime/seed.json"), "utf8"),
)
const directory = resolve(
  root,
  process.env.CG_SCREENSHOT_DIR || "docs/evidence/screenshots",
)
mkdirSync(directory, { recursive: true })
const headers = {
  "content-type": "application/json",
  "x-publishable-api-key": seed.publishableKey,
}
async function post(path, body) {
  const response = await fetch(`http://127.0.0.1:9000${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
  if (!response.ok)
    throw new Error(`Screenshot setup failed: ${response.status}`)
  return response.json()
}
const { cart } = await post("/store/carts", { region_id: seed.regionId })
await post(`/store/carts/${cart.id}/line-items`, {
  variant_id: seed.variantId,
  quantity: 3,
})
await post(`/store/carts/${cart.id}/promotions`, {
  promo_codes: [seed.promotionCode],
})
const browser = await chromium.launch()
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  })
  await context.addCookies([
    { name: "_medusa_cart_id", value: cart.id, url: "http://localhost:8000" },
  ])
  const page = await context.newPage()
  // Build a real guest wishlist through the same product buttons shoppers use.
  await page.goto("http://localhost:8000/dk/store")
  for (const title of [
    "Sage Cotton T-Shirt",
    "Navy Twill Overshirt",
    "Cream Knit Sweater",
  ]) {
    const save = page.getByRole("button", {
      name: `Save ${title} to wishlist`,
      exact: true,
    })
    await save.click()
    await expect(
      page.getByRole("button", {
        name: `Remove ${title} from wishlist`,
        exact: true,
      }),
    ).toBeEnabled()
  }
  await page.getByRole("button", { name: "Dismiss wishlist message" }).click()
  const catalogResponse = await fetch(
    `http://127.0.0.1:9000/store/products?limit=100&fields=*collection&region_id=${seed.regionId}`,
    { headers },
  )
  expect(catalogResponse.ok).toBe(true)
  const { products: allProducts } = await catalogResponse.json()
  for (const [handle, title] of [
    ["everyday-essentials", "Everyday Essentials"],
    ["off-duty", "Off Duty"],
    ["considered-layers", "Considered Layers"],
  ]) {
    const expected = allProducts.filter(
      (product) => product.collection?.handle === handle,
    )
    expect(expected.length).toBeGreaterThan(0)
    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: title, exact: true })
      .click()
    await expect(page).toHaveURL(new RegExp(`/collections/${handle}$`))
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible()
    await expect(page.getByTestId("product-wrapper")).toHaveCount(
      expected.length,
    )
  }
  await page.goto("http://localhost:8000/dk/cart", {
    waitUntil: "domcontentloaded",
  })
  await page.waitForFunction(
    () => document.documentElement.dataset.commerceguardHydrated === "true",
  )
  await expect(page.getByTestId("cart-total")).toHaveAttribute(
    "data-value",
    "27",
  )
  await expect(page.getByTestId("cart-discount")).toContainText("3.00")
  await page.screenshot({
    path: resolve(directory, "cart-promotion.png"),
    fullPage: true,
    animations: "disabled",
  })
  await page.goto("http://localhost:8000/dk/store", {
    waitUntil: "domcontentloaded",
  })
  await expect(page.getByTestId("product-wrapper")).toHaveCount(10)
  await page.screenshot({
    path: resolve(directory, "catalog.png"),
    fullPage: true,
    animations: "disabled",
  })
  if (process.env.CG_DESIGN_REVIEW) {
    const diagnostics = []
    page.on("pageerror", (error) =>
      diagnostics.push({ type: "pageerror", message: error.message }),
    )
    page.on("console", (message) => {
      if (message.type() === "error")
        diagnostics.push({ type: "consoleerror", message: message.text() })
    })
    for (const viewport of [
      { width: 1440, height: 1000 },
      { width: 393, height: 852 },
      { width: 320, height: 768 },
    ]) {
      await page.setViewportSize(viewport)
      for (const [name, route] of [
        ["home", "/dk"],
        ["catalog", "/dk/store"],
        ["product", `/dk/products/${seed.handle}?v_id=${seed.variantId}`],
        ["cart", "/dk/cart"],
        ["account", "/dk/account"],
        ["wishlist", "/dk/wishlist"],
        ["collection", "/dk/collections/considered-layers"],
        ["checkout", "/dk/checkout?step=address"],
        ["about", "/dk/about"],
      ]) {
        await page.goto(`http://localhost:8000${route}`, {
          waitUntil: "domcontentloaded",
        })
        await page.waitForFunction(
          () =>
            document.documentElement.dataset.commerceguardHydrated === "true",
        )
        if (name === "catalog")
          await expect(page.getByTestId("product-wrapper")).toHaveCount(10)
        if (name === "collection")
          await expect(page.getByTestId("product-wrapper")).toHaveCount(2)
        if (name === "wishlist")
          await expect(page.locator(".forme-wishlist-grid > li")).toHaveCount(3)
        if (name === "product")
          await expect(page.locator(".forme-gallery-image")).toHaveCount(1)
        // Trigger native lazy loading without changing React-owned attributes.
        // Mutating loading="eager" before selective hydration creates a false
        // hydration mismatch in otherwise correct application code.
        for (const photo of await page.locator("img").all()) {
          if (!(await photo.isVisible())) continue
          await photo.scrollIntoViewIfNeeded()
          await expect
            .poll(() =>
              photo.evaluate(
                (image) => image.complete && image.naturalWidth > 0,
              ),
            )
            .toBe(true)
        }
        await page.evaluate(async () => {
          await document.fonts.ready
          window.scrollTo({ top: 0, left: 0, behavior: "instant" })
        })
        await page.waitForFunction(() => window.scrollY === 0)
        diagnostics.push({
          name,
          viewport,
          ...(await page.evaluate(() => ({
            width: document.documentElement.scrollWidth,
            viewport: window.innerWidth,
            brokenImages: Array.from(document.images)
              .filter(
                (image) => image.getClientRects().length && !image.naturalWidth,
              )
              .map((image) => image.currentSrc),
          }))),
        })
        await page.screenshot({
          path: resolve(directory, `${name}-${viewport.width}.png`),
          fullPage: true,
          animations: "disabled",
        })
        if (name === "product") {
          await page.getByRole("button", { name: "Find your size" }).click()
          await expect(
            page.getByRole("dialog", { name: "Size guide", exact: true }),
          ).toBeVisible()
          await page.screenshot({
            path: resolve(directory, `size-guide-${viewport.width}.png`),
            animations: "disabled",
          })
          await page.keyboard.press("Escape")
          await page.getByRole("button", { name: "Zoom image" }).first().click()
          await expect(
            page.getByRole("dialog", { name: "Product image 1", exact: true }),
          ).toBeVisible()
          await page.screenshot({
            path: resolve(directory, `image-zoom-${viewport.width}.png`),
            animations: "disabled",
          })
          await page.keyboard.press("Escape")
        }
        if (name === "home" && viewport.width === 1440)
          await page.screenshot({
            path: resolve(directory, "home-preview.png"),
            fullPage: false,
            animations: "disabled",
          })
      }
    }
    for (const path of [
      "/forme/favicon.svg",
      "/favicon.ico",
      "/opengraph-image.jpg",
      "/twitter-image.jpg",
    ]) {
      const response = await fetch(`http://localhost:8000${path}`)
      const bytes = (await response.arrayBuffer()).byteLength
      expect(response.ok, `Brand asset ${path}`).toBe(true)
      diagnostics.push({
        type: "asset",
        path,
        status: response.status,
        bytes,
        contentType: response.headers.get("content-type"),
      })
    }
    const { writeFileSync } = await import("node:fs")
    writeFileSync(
      resolve(directory, "diagnostics.json"),
      JSON.stringify(diagnostics, null, 2),
    )
    expect(
      diagnostics.filter(
        (item) => item.type === "pageerror" || item.type === "consoleerror",
      ),
    ).toEqual([])
    expect(
      diagnostics
        .filter((item) => item.name)
        .every(
          (item) =>
            item.width <= item.viewport && item.brokenImages.length === 0,
        ),
      "No overflow or broken image across the reviewed pages",
    ).toBe(true)
  }
  if (process.env.REPORT_URL) {
    const report = await context.newPage()
    await report.goto(process.env.REPORT_URL)
    await expect(report.getByPlaceholder("Search tests")).toBeVisible()
    await report.screenshot({
      path: resolve(directory, "regression-report.png"),
      fullPage: false,
      animations: "disabled",
    })
  }
} finally {
  await browser.close()
}
console.log(`Captured real storefront evidence under ${directory}.`)
