import { test, expect } from "../../src/fixtures/test.js"
import { jsonOk } from "../../src/api/store-client.js"
import { CartPage, setCart } from "../../src/pages/storefront.js"

test("INT-001 R-CART UI quantity API totals and SQL line records agree @smoke", async ({
  store,
  db,
  page,
  context,
  seed,
}) => {
  const cart = await store.cartWithItem()
  await setCart(context, cart.id)
  const view = new CartPage(page)
  await view.open()
  await view.quantity(3)
  await view.expectTotal(30)
  const api = await store.cart(cart.id)
  const rows = await db.rows<{
    quantity: number
    unit_price: string
    variant_id: string
  }>(
    "SELECT quantity, unit_price, variant_id FROM cart_line_item WHERE cart_id=$1 AND deleted_at IS NULL",
    [cart.id],
  )
  expect(rows).toHaveLength(1)
  expect(Number(rows[0].quantity)).toBe(api.items[0].quantity)
  expect(rows[0].variant_id).toBe(seed.variantId)
  expect(Number(rows[0].quantity) * Number(rows[0].unit_price)).toBe(api.total)
})
test("INT-002 R-PROMO promotion adjustment SQL matches API and expected discount", async ({
  store,
  db,
  seed,
}) => {
  const cart = await store.cartWithItem(3)
  await jsonOk(
    await store.post(`/store/carts/${cart.id}/promotions`, {
      promo_codes: [seed.promotionCode],
    }),
  )
  const api = await store.cart(cart.id)
  const rows = await db.rows<{ amount: string; code: string }>(
    "SELECT a.amount, a.code FROM cart_line_item_adjustment a JOIN cart_line_item i ON i.id=a.item_id WHERE i.cart_id=$1 AND a.deleted_at IS NULL AND i.deleted_at IS NULL",
    [cart.id],
  )
  expect(rows).toHaveLength(1)
  expect(rows[0].code).toBe(seed.promotionCode)
  expect(Number(rows[0].amount)).toBe(3)
  expect(api.discount_total).toBe(Number(rows[0].amount))
  expect(api.total).toBe(27)
})
test("INT-003 R-INVENTORY rejected stock overflow writes no cart line", async ({
  store,
  db,
  seed,
}) => {
  const cart = await store.createCart()
  expect(
    (
      await store.post(`/store/carts/${cart.id}/line-items`, {
        variant_id: seed.variantId,
        quantity: seed.stock + 1,
      })
    ).status(),
  ).toBe(400)
  const rows = await db.rows(
    "SELECT id FROM cart_line_item WHERE cart_id=$1 AND deleted_at IS NULL",
    [cart.id],
  )
  expect(rows).toHaveLength(0)
  expect((await store.cart(cart.id)).total).toBe(0)
})
test("INT-004 R-ORDER completed order SQL items match API quantities and price @smoke", async ({
  store,
  db,
  seed,
}) => {
  const cart = await store.cartWithItem(2)
  await store.readyForCheckout(cart.id)
  const order = await store.complete(cart.id)
  const rows = await db.rows<{
    quantity: string
    variant_id: string
    unit_price: string
  }>(
    "SELECT i.quantity, l.variant_id, l.unit_price FROM order_item i JOIN order_line_item l ON l.id=i.item_id WHERE i.order_id=$1 AND i.deleted_at IS NULL AND l.deleted_at IS NULL",
    [order.id],
  )
  expect(rows).toHaveLength(1)
  expect(Number(rows[0].quantity)).toBe(2)
  expect(rows[0].variant_id).toBe(seed.variantId)
  expect(Number(rows[0].unit_price)).toBe(seed.unitPrice)
  expect(order.items[0].quantity).toBe(Number(rows[0].quantity))
  const carts = await db.rows<{ completed_at: Date | null }>(
    "SELECT completed_at FROM cart WHERE id=$1",
    [cart.id],
  )
  expect(carts[0].completed_at).not.toBeNull()
})
test("INT-005 R-ORDER repeat completion preserves one order for the cart", async ({
  store,
  db,
}) => {
  const cart = await store.cartWithItem()
  await store.readyForCheckout(cart.id)
  const a = await store.complete(cart.id)
  const b = await store.complete(cart.id)
  expect(a.id).toBe(b.id)
  const rows = await db.rows(
    "SELECT id FROM order_cart WHERE cart_id=$1 AND deleted_at IS NULL",
    [cart.id],
  )
  expect(rows).toHaveLength(1)
})
test("INT-006 R-ORDER failed completion has no order link and leaves cart incomplete", async ({
  store,
  db,
}) => {
  const cart = await store.cartWithItem()
  const response = await store.post(`/store/carts/${cart.id}/complete`, {})
  expect(response.status()).toBe(400)
  expect(
    await db.rows(
      "SELECT id FROM order_cart WHERE cart_id=$1 AND deleted_at IS NULL",
      [cart.id],
    ),
  ).toHaveLength(0)
  const rows = await db.rows<{ completed_at: Date | null }>(
    "SELECT completed_at FROM cart WHERE id=$1",
    [cart.id],
  )
  expect(rows[0].completed_at).toBeNull()
})
