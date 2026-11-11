import { test, expect } from "../../src/fixtures/test.js"

test("API-028 R-ORDER checkout creates an order with correct items and totals @smoke", async ({
  store,
  seed,
}) => {
  const cart = await store.cartWithItem(2)
  const ready = await store.readyForCheckout(cart.id)
  expect(ready.shipping_total).toBe(10)
  const order = await store.complete(cart.id)
  expect(order.items).toHaveLength(1)
  expect(order.items[0]).toMatchObject({
    variant_id: seed.variantId,
    quantity: 2,
  })
  expect(order.total).toBe(2 * seed.unitPrice + 10)
})
test("API-029 R-ORDER completing the same cart twice returns the same order", async ({
  store,
}) => {
  const cart = await store.cartWithItem()
  await store.readyForCheckout(cart.id)
  const first = await store.complete(cart.id)
  const second = await store.complete(cart.id)
  expect(second.id).toBe(first.id)
})
test("API-030 R-ORDER incomplete checkout returns an error without order data", async ({
  store,
}) => {
  const cart = await store.cartWithItem()
  const response = await store.post(`/store/carts/${cart.id}/complete`, {})
  const body = await response.json()
  expect(response.status()).toBe(400)
  expect(body).not.toHaveProperty("order")
  expect((await store.cart(cart.id)).completed_at).toBeNull()
})
test("API-031 R-ACCOUNT authenticated order history includes only the owner order", async ({
  store,
}) => {
  const owner = await store.customer()
  const other = await store.customer()
  const cart = await owner.client.cartWithItem()
  await owner.client.readyForCheckout(cart.id, owner.email)
  const order = await owner.client.complete(cart.id)
  const own = await (await owner.client.get("/store/orders")).json()
  const foreign = await (await other.client.get("/store/orders")).json()
  expect(own.orders.map((value: { id: string }) => value.id)).toContain(
    order.id,
  )
  expect(foreign.orders.map((value: { id: string }) => value.id)).not.toContain(
    order.id,
  )
})
