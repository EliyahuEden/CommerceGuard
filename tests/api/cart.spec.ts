import { test, expect } from "../../src/fixtures/test.js"
import { jsonOk, type Cart } from "../../src/api/store-client.js"

test("API-007 R-CART an empty cart starts at zero @smoke", async ({
  store,
  seed,
}) => {
  const cart = await store.createCart()
  expect(cart.region_id).toBe(seed.regionId)
  expect(cart.currency_code).toBe("eur")
  expect(cart.items).toHaveLength(0)
  expect(cart.total).toBe(0)
})
test("API-008 R-CART quantity multiplies unit price exactly @smoke", async ({
  store,
  seed,
}) => {
  const cart = await store.cartWithItem(3)
  expect(cart.items).toHaveLength(1)
  expect(cart.items[0].quantity).toBe(3)
  expect(cart.item_subtotal).toBe(3 * seed.unitPrice)
  expect(cart.total).toBe(3 * seed.unitPrice)
})
test("API-009 R-CART updating quantity recalculates totals", async ({
  store,
  seed,
}) => {
  const cart = await store.cartWithItem()
  await jsonOk(
    await store.post(`/store/carts/${cart.id}/line-items/${cart.items[0].id}`, {
      quantity: 4,
    }),
  )
  const updated = await store.cart(cart.id)
  expect(updated.items[0].quantity).toBe(4)
  expect(updated.total).toBe(seed.unitPrice * 4)
})
test("API-010 R-CART removing the final item returns the cart to zero", async ({
  store,
}) => {
  const cart = await store.cartWithItem()
  await jsonOk(
    await store.delete(
      `/store/carts/${cart.id}/line-items/${cart.items[0].id}`,
    ),
  )
  const empty = await store.cart(cart.id)
  expect(empty.items).toHaveLength(0)
  expect(empty.total).toBe(0)
})
for (const quantity of [0, -1]) {
  test(`API-Q${quantity} R-INVENTORY rejects invalid add quantity ${quantity}`, async ({
    store,
  }) => {
    const cart = await store.createCart()
    const response = await store.post(`/store/carts/${cart.id}/line-items`, {
      variant_id: store.seed.variantId,
      quantity,
    })
    expect(response.status()).toBe(400)
    expect((await response.json()).message).toEqual(expect.any(String))
    expect((await store.cart(cart.id)).items).toHaveLength(0)
  })
}
test("API-013 R-INVENTORY fractional input must be rejected or preserved without silent coercion @product-bug", async ({
  store,
  seed,
}) => {
  const empty = await store.createCart()
  const response = await store.post(`/store/carts/${empty.id}/line-items`, {
    variant_id: seed.variantId,
    quantity: 1.5,
  })
  if (response.status() === 400) {
    expect((await store.cart(empty.id)).items).toHaveLength(0)
  } else {
    const { cart } = await jsonOk<{ cart: Cart }>(response)
    expect(
      cart.items[0].quantity,
      "CG-B001: accepted buyer quantity must not be silently rounded",
    ).toBe(1.5)
    expect(cart.total).toBe(seed.unitPrice * 1.5)
  }
})
test("API-014 R-INVENTORY stock overflow is rejected without cart changes", async ({
  store,
  seed,
}) => {
  const cart = await store.createCart()
  const response = await store.post(`/store/carts/${cart.id}/line-items`, {
    variant_id: seed.variantId,
    quantity: seed.stock + 1,
  })
  expect(response.status()).toBe(400)
  expect((await store.cart(cart.id)).items).toHaveLength(0)
})
test("API-015 R-ERROR missing variant is a validation error", async ({
  store,
}) => {
  const cart = await store.createCart()
  expect(
    (
      await store.post(`/store/carts/${cart.id}/line-items`, { quantity: 1 })
    ).status(),
  ).toBe(400)
  expect((await store.cart(cart.id)).total).toBe(0)
})
test("API-016 R-CART repeated add requests merge quantity rather than duplicate lines", async ({
  store,
  seed,
}) => {
  const cart = await store.cartWithItem()
  const { cart: updated } = await store.addItem(cart.id)
  expect(updated.items).toHaveLength(1)
  expect(updated.items[0].quantity).toBe(2)
  expect(updated.total).toBe(2 * seed.unitPrice)
})
test("API-017 R-PROMO ten percent promotion uses item subtotal @smoke", async ({
  store,
  seed,
}) => {
  const cart = await store.cartWithItem(3)
  const { cart: discounted } = await jsonOk<{ cart: Cart }>(
    await store.post(`/store/carts/${cart.id}/promotions`, {
      promo_codes: [seed.promotionCode],
    }),
  )
  expect(discounted.discount_total).toBe(3 * seed.unitPrice * 0.1)
  expect(discounted.total).toBe(3 * seed.unitPrice * 0.9)
})
test("API-018 R-PROMO applying the same promotion twice does not stack discounts", async ({
  store,
  seed,
}) => {
  const cart = await store.cartWithItem(2)
  for (let attempt = 0; attempt < 2; attempt++)
    await jsonOk(
      await store.post(`/store/carts/${cart.id}/promotions`, {
        promo_codes: [seed.promotionCode],
      }),
    )
  expect((await store.cart(cart.id)).discount_total).toBe(
    2 * seed.unitPrice * 0.1,
  )
})
test("API-019 R-PROMO unknown promotion grants no discount", async ({
  store,
}) => {
  const cart = await store.cartWithItem()
  await store.post(`/store/carts/${cart.id}/promotions`, {
    promo_codes: ["CG_DOES_NOT_EXIST"],
  })
  const updated = await store.cart(cart.id)
  expect(updated.discount_total).toBe(0)
  expect(updated.total).toBe(cart.total)
})
