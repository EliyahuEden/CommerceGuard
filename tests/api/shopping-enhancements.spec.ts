import { test, expect } from "../../src/fixtures/test.js"
import { jsonOk } from "../../src/api/store-client.js"
import { env } from "../../src/config.js"

test("API-032 R-CATALOG expanded collection has varied regional prices, colors and inventory @smoke", async ({
  store,
  seed,
}) => {
  const { products } = await jsonOk<{
    products: {
      handle: string
      collection: { handle: string }
      metadata: { fit: string; care: string }
      variants: {
        inventory_quantity: number
        calculated_price: { calculated_amount: number }
      }[]
    }[]
  }>(
    await store.get(
      `/store/products?limit=100&region_id=${seed.regionId}&fields=*variants.calculated_price,+variants.inventory_quantity,*collection,+metadata`,
    ),
  )
  expect(products).toHaveLength(10)
  expect(
    new Set(products.map((product) => product.collection.handle)).size,
  ).toBeGreaterThanOrEqual(3)
  expect(
    new Set(
      products.flatMap((product) =>
        product.variants.map(
          (variant) => variant.calculated_price.calculated_amount,
        ),
      ),
    ).size,
  ).toBeGreaterThanOrEqual(6)
  for (const product of products)
    expect(product.metadata).toMatchObject({
      fit: expect.any(String),
      care: expect.any(String),
    })
  const hoodie = products.find(
    (product) => product.handle === "charcoal-hoodie",
  )!
  expect(
    hoodie.variants.some((variant) => variant.inventory_quantity === 0),
  ).toBe(true)
  expect(
    hoodie.variants.some((variant) => variant.inventory_quantity > 0),
  ).toBe(true)
})

test("API-033 R-INVENTORY unavailable new variant is rejected without changing an existing cart", async ({
  store,
}) => {
  const { products } = await jsonOk<{
    products: { variants: { id: string; title: string }[] }[]
  }>(await store.get("/store/products?handle=charcoal-hoodie"))
  const variant = products[0].variants.find((value) =>
    value.title.startsWith("XL"),
  )!
  const cart = await store.cartWithItem(2)
  const response = await store.post(`/store/carts/${cart.id}/line-items`, {
    variant_id: variant.id,
    quantity: 1,
  })
  expect(response.status()).toBe(400)
  const unchanged = await store.cart(cart.id)
  expect(
    unchanged.items.map((item) => ({
      variant: item.variant_id,
      quantity: item.quantity,
    })),
  ).toEqual(
    cart.items.map((item) => ({
      variant: item.variant_id,
      quantity: item.quantity,
    })),
  )
  expect(unchanged.total).toBe(cart.total)
})

test("API-034 R-WISHLIST customer wishlist persists and remains isolated from another account @smoke", async ({
  store,
  seed,
}) => {
  const a = await store.customer()
  const b = await store.customer()
  await jsonOk(
    await a.client.post("/store/customers/me", {
      metadata: { forme_wishlist: [seed.productId] },
    }),
  )
  const saved = await jsonOk<{
    customer: { metadata: { forme_wishlist?: string[] } }
  }>(await a.client.get("/store/customers/me"))
  const other = await jsonOk<typeof saved>(
    await b.client.get("/store/customers/me"),
  )
  expect(saved.customer.metadata.forme_wishlist).toEqual([seed.productId])
  expect(other.customer.metadata?.forme_wishlist).toBeUndefined()
  const anonymous = await store.post("/store/customers/me", {
    metadata: { forme_wishlist: [] },
  })
  expect(anonymous.status()).toBe(401)
  expect(
    (await jsonOk<typeof saved>(await a.client.get("/store/customers/me")))
      .customer.metadata.forme_wishlist,
  ).toEqual([seed.productId])
})

test("API-035 R-WISHLIST session endpoint is private, uncached and scoped to the session cookie @smoke", async ({
  store,
  seed,
}) => {
  const owner = await store.customer()
  const other = await store.customer()
  await jsonOk(
    await owner.client.post("/store/customers/me", {
      metadata: { forme_wishlist: [seed.productId] },
    }),
  )
  const own = await store.request.get(`${env.BASE_URL}/api/wishlist`, {
    headers: { cookie: `_medusa_jwt=${owner.token}` },
  })
  expect(own.status()).toBe(200)
  expect(own.headers()["cache-control"]).toContain("no-store")
  expect(own.headers()["cache-control"]).toContain("private")
  expect(await own.json()).toEqual({
    customerId: owner.id,
    ids: [seed.productId],
  })
  const foreign = await store.request.get(
    `${env.BASE_URL}/api/wishlist?customer_id=${owner.id}`,
    { headers: { cookie: `_medusa_jwt=${other.token}` } },
  )
  expect(await foreign.json()).toEqual({ customerId: other.id, ids: [] })
  const anonymous = await store.request.get(`${env.BASE_URL}/api/wishlist`)
  expect(await anonymous.json()).toEqual({ customerId: null, ids: [] })
})
