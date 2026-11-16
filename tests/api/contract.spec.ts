import { test, expect } from "../../src/fixtures/test.js"
import { jsonOk } from "../../src/api/store-client.js"
import { z } from "zod"

// Contract checks: the response shapes the storefront and any other client depend on.
// Schemas are strict about the fields clients read and permissive about additions.

const errorEnvelope = z
  .object({ message: z.string().min(1), type: z.string().optional() })
  .passthrough()

const money = z.number().finite()

const shippingOptionSchema = z
  .object({
    id: z.string().startsWith("so_"),
    name: z.string().min(1),
    price_type: z.enum(["flat", "calculated"]),
    amount: money.nonnegative(),
  })
  .passthrough()

const orderSchema = z
  .object({
    id: z.string().startsWith("order_"),
    display_id: z.number().int().positive(),
    currency_code: z.string().length(3),
    email: z.string().email(),
    status: z.string(),
    total: money,
    subtotal: money,
    item_total: money,
    shipping_total: money,
    tax_total: money,
    discount_total: money,
    items: z
      .array(
        z
          .object({
            id: z.string(),
            variant_id: z.string(),
            quantity: z.number().int().positive(),
            unit_price: money,
          })
          .passthrough(),
      )
      .min(1),
  })
  .passthrough()

test("API-036 R-ORDER completed order matches its contract and money invariants", async ({
  store,
  seed,
}) => {
  const cart = await store.cartWithItem(3)
  await jsonOk(
    await store.post(`/store/carts/${cart.id}/promotions`, {
      promo_codes: [seed.promotionCode],
    }),
  )
  await store.readyForCheckout(cart.id)
  const order = orderSchema.parse(await store.complete(cart.id))
  expect(order.currency_code).toBe("eur")
  // The total must be reproducible from its parts, so no component is dropped or doubled.
  expect(order.total).toBe(
    order.item_total + order.shipping_total + order.tax_total,
  )
  expect(order.discount_total).toBe(3)
  expect(order.items[0].quantity * order.items[0].unit_price).toBe(
    3 * seed.unitPrice,
  )
})

test("API-037 R-ERROR client and not-found errors share one JSON envelope", async ({
  store,
}) => {
  const cases = [
    { path: "/store/products/prod_does_not_exist", status: 404 },
    { path: "/store/carts/cart_does_not_exist", status: 404 },
    { path: "/store/customers/me", status: 401 },
  ]
  for (const { path, status } of cases) {
    const response = await store.get(path)
    expect(response.status(), path).toBe(status)
    expect(response.headers()["content-type"], path).toContain(
      "application/json",
    )
    const body = errorEnvelope.parse(await response.json())
    // Internals must not leak through error responses.
    expect(JSON.stringify(body), path).not.toMatch(
      /stack|node_modules|select .* from/i,
    )
  }
})

test("API-038 R-CART shipping options expose a typed price the cart then charges", async ({
  store,
}) => {
  const cart = await store.cartWithItem()
  await store.readyForCheckout(cart.id)
  const { shipping_options } = await jsonOk<{ shipping_options: unknown[] }>(
    await store.get(`/store/shipping-options?cart_id=${cart.id}`),
  )
  const options = z.array(shippingOptionSchema).min(1).parse(shipping_options)
  const standard = options.find((option) => option.name === "Standard Shipping")
  expect(standard).toBeDefined()
  expect((await store.cart(cart.id)).shipping_total).toBe(standard!.amount)
})

test("API-039 R-ACCESS customer responses never expose credentials", async ({
  store,
}) => {
  const customer = await store.customer()
  const body = await jsonOk<{ customer: Record<string, unknown> }>(
    await customer.client.get("/store/customers/me"),
  )
  expect(body.customer.email).toBe(customer.email)
  const sensitive = /password|hash|secret|token/i
  const keys: string[] = []
  const walk = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(walk)
    if (value && typeof value === "object")
      for (const [key, child] of Object.entries(value)) {
        keys.push(key)
        walk(child)
      }
  }
  walk(body)
  expect(keys.filter((key) => sensitive.test(key))).toEqual([])
})
