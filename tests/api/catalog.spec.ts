import { test, expect } from "../../src/fixtures/test.js"
import { jsonOk } from "../../src/api/store-client.js"
import { z } from "zod"

const productSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    handle: z.string(),
    variants: z.array(z.object({ id: z.string() }).passthrough()),
  })
  .passthrough()

test("API-001 R-CATALOG published catalog has the required contract @smoke", async ({
  store,
}) => {
  const body = await jsonOk<{ products: unknown[]; count: number }>(
    await store.get("/store/products?limit=10"),
  )
  expect(body.count).toBeGreaterThanOrEqual(4)
  expect(z.array(productSchema).parse(body.products).length).toBeGreaterThan(0)
})
test("API-002 R-CATALOG variant price is calculated for the seeded region @smoke", async ({
  store,
  seed,
}) => {
  const { product } = await jsonOk<{
    product: {
      variants: {
        id: string
        calculated_price: { calculated_amount: number; currency_code: string }
      }[]
    }
  }>(
    await store.get(
      `/store/products/${seed.productId}?region_id=${seed.regionId}&fields=*variants.calculated_price`,
    ),
  )
  const variant = product.variants.find((value) => value.id === seed.variantId)!
  expect(variant.calculated_price.calculated_amount).toBe(seed.unitPrice)
  expect(variant.calculated_price.currency_code).toBe("eur")
})
test("API-003 R-CATALOG text query excludes unrelated products", async ({
  store,
}) => {
  const { products } = await jsonOk<{ products: { title: string }[] }>(
    await store.get("/store/products?q=T-Shirt"),
  )
  expect(products.length).toBeGreaterThan(0)
  expect(
    products.every((product) =>
      product.title.toLowerCase().includes("t-shirt"),
    ),
  ).toBe(true)
})
test("API-004 R-CATALOG pagination returns distinct records and stable count", async ({
  store,
}) => {
  const a = await jsonOk<{ products: { id: string }[]; count: number }>(
    await store.get("/store/products?limit=1&offset=0&order=id"),
  )
  const b = await jsonOk<typeof a>(
    await store.get("/store/products?limit=1&offset=1&order=id"),
  )
  expect(a.products).toHaveLength(1)
  expect(b.products).toHaveLength(1)
  expect(a.products[0].id).not.toBe(b.products[0].id)
  expect(a.count).toBe(b.count)
})
test("API-005 R-ERROR unknown product returns a structured 404", async ({
  store,
}) => {
  const response = await store.get("/store/products/prod_commerceguard_missing")
  expect(response.status()).toBe(404)
  expect(await response.json()).toMatchObject({
    type: "not_found",
    message: expect.any(String),
  })
})
test("API-006 R-ACCESS store catalog rejects requests without a publishable key", async ({
  store,
}) => {
  const response = await store.request.get("/store/products")
  expect(response.status()).toBe(400)
  expect((await response.json()).message).toMatch(/publishable/i)
})
