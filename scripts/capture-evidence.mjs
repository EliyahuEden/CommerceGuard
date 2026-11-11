import { chromium, expect } from "@playwright/test"
import { readFileSync, mkdirSync } from "node:fs"
import { resolve } from "node:path"
import { root } from "./lib.mjs"

const seed = JSON.parse(
  readFileSync(resolve(root, ".runtime/seed.json"), "utf8"),
)
const directory = resolve(root, "docs/evidence/screenshots")
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
  })
  await page.goto("http://localhost:8000/dk/store", {
    waitUntil: "domcontentloaded",
  })
  await expect(page.getByTestId("product-wrapper")).toHaveCount(4)
  await page.screenshot({
    path: resolve(directory, "catalog.png"),
    fullPage: true,
  })
  if (process.env.REPORT_URL) {
    const report = await context.newPage()
    await report.goto(process.env.REPORT_URL)
    await expect(report.getByPlaceholder("Search tests")).toBeVisible()
    await report.screenshot({
      path: resolve(directory, "regression-report.png"),
      fullPage: false,
    })
  }
} finally {
  await browser.close()
}
console.log(
  "Captured real storefront evidence under docs/evidence/screenshots.",
)
