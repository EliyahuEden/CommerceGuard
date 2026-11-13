import { chromium, expect as baseExpect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { readFileSync, mkdirSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { root, waitFor } from "./lib.mjs"

// A separately reported, keyboard-only Chromium journey. API calls create only
// its unique account; every shopping, authentication and checkout action uses keys.
const expect = baseExpect.configure({ timeout: 15_000 })
const seed = JSON.parse(
  readFileSync(resolve(root, ".runtime/seed.json"), "utf8"),
)
const directory = resolve(
  root,
  process.env.CG_KEYBOARD_EVIDENCE_DIR || "docs/evidence/enhancements/keyboard",
)
mkdirSync(directory, { recursive: true })
await waitFor("http://127.0.0.1:9000/health")
const email = `keyboard-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.test`
const password = `Keyboard-${crypto.randomUUID()}!`
async function post(path, data, token) {
  const response = await fetch(`http://127.0.0.1:9000${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-publishable-api-key": seed.publishableKey,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  })
  if (!response.ok)
    throw new Error(`Keyboard account setup: HTTP ${response.status}`)
  return response.json()
}
const { token } = await post("/auth/customer/emailpass/register", {
  email,
  password,
})
await post(
  "/store/customers",
  { email, first_name: "Keyboard", last_name: "Audit" },
  token,
)
const browser = await chromium.launch()
const steps = []
const startedAt = new Date().toISOString()
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  page.setDefaultTimeout(15_000)
  page.setDefaultNavigationTimeout(60_000)
  async function tabTo(locator) {
    await expect(locator).toBeVisible()
    await expect(locator).toBeEnabled()
    for (let count = 0; count < 200; count++) {
      if (
        await locator.evaluate((element) => element === document.activeElement)
      )
        return
      await page.keyboard.press("Tab")
    }
    if (page.url().includes("/checkout")) {
      writeFileSync(
        resolve(directory, "focus-diagnostic.json"),
        JSON.stringify(
          await page.evaluate(() => ({
            url: location.href,
            active: {
              tag: document.activeElement?.tagName,
              id: document.activeElement?.id,
              role: document.activeElement?.getAttribute("role"),
            },
            radios: Array.from(
              document.querySelectorAll('[role="radio"], [role="radiogroup"]'),
            ).map((element) => ({
              tag: element.tagName,
              role: element.getAttribute("role"),
              tabIndex: element.getAttribute("tabindex"),
              checked: element.getAttribute("aria-checked"),
              disabled: element.getAttribute("aria-disabled"),
              text: element.textContent,
              html: element.outerHTML.slice(0, 1800),
            })),
          })),
          null,
          2,
        ),
      )
      await page.screenshot({
        path: resolve(directory, "focus-diagnostic.png"),
        fullPage: true,
      })
    }
    throw new Error(
      `Keyboard could not reach ${(await locator.getAttribute("data-testid")) || (await locator.getAttribute("aria-label")) || "the requested control"}`,
    )
  }
  async function activate(locator) {
    await tabTo(locator)
    const href = await locator.getAttribute("href")
    await page.keyboard.press("Enter")
    if (href)
      await page.waitForURL(new URL(href, page.url()).href, {
        timeout: 60_000,
        waitUntil: "domcontentloaded",
      })
  }
  async function type(locator, value) {
    await tabTo(locator)
    await page.keyboard.press("ControlOrMeta+A")
    await page.keyboard.type(value)
  }
  async function scan(name) {
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze()
    writeFileSync(
      resolve(directory, `a11y-${name}.json`),
      JSON.stringify(
        {
          url: page.url(),
          violations: result.violations,
          passes: result.passes.map((rule) => rule.id),
        },
        null,
        2,
      ),
    )
    expect(result.violations, `Accessibility at ${name}`).toEqual([])
  }
  async function chooseRadio(group, label) {
    const target = group.getByRole("radio").filter({ hasText: label })
    await tabTo(group.locator('[role="radio"][tabindex="0"]').first())
    const count = await group.getByRole("radio").count()
    for (let index = 0; index < count; index++) {
      if (
        await target.evaluate((element) => element === document.activeElement)
      )
        break
      await page.keyboard.press("ArrowDown")
    }
    await expect(target).toBeFocused()
    if ((await target.getAttribute("aria-checked")) !== "true")
      await page.keyboard.press("Space")
    await expect(target).toHaveAttribute("aria-checked", "true")
  }
  await page.goto("http://localhost:8000/dk", { waitUntil: "domcontentloaded" })
  await page.waitForFunction(
    () => document.documentElement.dataset.commerceguardHydrated === "true",
    undefined,
    { timeout: 60_000 },
  )
  await activate(page.getByRole("link", { name: "Skip to content" }))
  await expect(page.locator("#main-content")).toBeFocused()
  steps.push("Skip link moves focus to the main landmark")
  await activate(page.getByTestId("nav-account-link"))
  await type(page.getByTestId("email-input"), email)
  await type(page.getByTestId("password-input"), password)
  await activate(page.getByTestId("sign-in-button"))
  await expect(page.getByTestId("account-page")).toHaveClass(
    /forme-account-signed-in/,
  )
  steps.push("Existing customer signs in using keyboard controls")
  await activate(
    page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Shop all", exact: true }),
  )
  await activate(
    page
      .getByTestId("products-list")
      .getByRole("link", { name: seed.productTitle, exact: true }),
  )
  const color = page
    .getByRole("group", { name: "Select Color", exact: true })
    .getByRole("radio", { checked: true })
  await tabTo(color)
  await page.keyboard.press("ArrowRight")
  await activate(page.getByRole("button", { name: "Find your size" }))
  await expect(
    page.getByRole("dialog", { name: "Size guide", exact: true }),
  ).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: "Find your size" }),
  ).toBeFocused()
  steps.push(
    "Catalog, variant radio group and size dialog work without a pointer",
  )
  await activate(page.getByTestId("add-product-button"))
  await expect(page.getByTestId("nav-cart-link")).toContainText("(1)")
  await activate(page.getByTestId("nav-cart-link"))
  const quantity = page.getByTestId("product-select-button")
  await tabTo(quantity)
  await page.keyboard.press("2")
  await expect(quantity).toHaveValue("2")
  await expect(page.getByTestId("cart-total")).toHaveAttribute(
    "data-value",
    "20",
  )
  await activate(page.getByTestId("add-discount-button"))
  await type(page.getByTestId("discount-input"), seed.promotionCode)
  await activate(page.getByTestId("discount-apply-button"))
  await expect(page.getByTestId("cart-total")).toHaveAttribute(
    "data-value",
    "18",
  )
  steps.push(
    "Quantity and promotion controls update independent expected totals",
  )
  await activate(page.getByRole("link", { name: /Continue to checkout/ }))
  await type(page.getByTestId("shipping-first-name-input"), "Keyboard")
  await activate(page.getByTestId("submit-address-button"))
  await expect(page.getByTestId("address-error-message")).toContainText(
    "Your details have been kept",
  )
  await expect(page.getByTestId("shipping-first-name-input")).toHaveValue(
    "Keyboard",
  )
  await expect(page.getByTestId("shipping-last-name-input")).toBeFocused()
  for (const [id, value] of [
    ["shipping-last-name-input", "Audit"],
    ["shipping-address-input", "Test Street 42"],
    ["shipping-postal-code-input", "2100"],
    ["shipping-city-input", "Copenhagen"],
  ])
    await type(page.getByTestId(id), value)
  await tabTo(page.getByTestId("shipping-country-select"))
  await page.keyboard.press("d")
  await expect(page.getByTestId("shipping-country-select")).toHaveValue("dk")
  await type(page.getByTestId("shipping-email-input"), email)
  await activate(page.getByTestId("submit-address-button"))
  steps.push(
    "Address validation announces errors, preserves input and supports correction",
  )
  await chooseRadio(
    page.getByRole("radiogroup", { name: "Delivery methods" }),
    "Standard Shipping",
  )
  await scan("delivery")
  await activate(page.getByTestId("submit-delivery-option-button"))
  await chooseRadio(
    page.getByRole("radiogroup", { name: "Payment methods" }),
    /manual|test/i,
  )
  await scan("payment")
  await activate(page.getByTestId("submit-payment-button"))
  await scan("review")
  await activate(page.getByTestId("submit-order-button"))
  await expect(page.getByTestId("order-complete-container")).toBeVisible()
  await expect(page.getByTestId("cart-total")).toHaveAttribute(
    "data-value",
    "28",
  )
  await page.screenshot({
    path: resolve(directory, "keyboard-order-confirmation.png"),
    fullPage: true,
    animations: "disabled",
  })
  steps.push("Delivery, manual payment and order creation complete using keys")
  await activate(page.getByTestId("nav-account-link"))
  await activate(
    page
      .getByTestId("account-nav")
      .getByRole("link", { name: "Orders", exact: true }),
  )
  await expect(page.getByTestId("order-card")).toHaveCount(1)
  await expect(page.getByTestId("order-card")).toContainText(seed.productTitle)
  steps.push("The customer's new order appears in account history")
  writeFileSync(
    resolve(directory, "results.json"),
    JSON.stringify(
      {
        startedAt,
        finishedAt: new Date().toISOString(),
        status: "passed",
        browser: "Chromium desktop",
        pointerActions: 0,
        steps,
        limitation:
          "Keyboard audit supplements axe. No real screen-reader or real-device certification is claimed.",
      },
      null,
      2,
    ),
  )
  console.log(`Keyboard-only journey passed (${steps.length} verified stages).`)
} catch (error) {
  writeFileSync(
    resolve(directory, "results.json"),
    JSON.stringify(
      {
        startedAt,
        finishedAt: new Date().toISOString(),
        status: "failed",
        browser: "Chromium desktop",
        pointerActions: 0,
        steps,
        error: error.message,
      },
      null,
      2,
    ),
  )
  throw error
} finally {
  await browser.close()
}
