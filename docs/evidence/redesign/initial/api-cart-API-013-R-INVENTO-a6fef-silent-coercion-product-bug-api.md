# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\cart.spec.ts >> API-013 R-INVENTORY fractional input must be rejected or preserved without silent coercion @product-bug
- Location: tests\api\cart.spec.ts:65:1

# Error details

```
Error: CG-B001: accepted buyer quantity must not be silently rounded

expect(received).toBe(expected) // Object.is equality

Expected: 1.5
Received: 2
```

# Test source

```ts
  1   | import { test, expect } from "../../src/fixtures/test.js"
  2   | import { jsonOk, type Cart } from "../../src/api/store-client.js"
  3   | 
  4   | test("API-007 R-CART an empty cart starts at zero @smoke", async ({
  5   |   store,
  6   |   seed,
  7   | }) => {
  8   |   const cart = await store.createCart()
  9   |   expect(cart.region_id).toBe(seed.regionId)
  10  |   expect(cart.currency_code).toBe("eur")
  11  |   expect(cart.items).toHaveLength(0)
  12  |   expect(cart.total).toBe(0)
  13  | })
  14  | test("API-008 R-CART quantity multiplies unit price exactly @smoke", async ({
  15  |   store,
  16  |   seed,
  17  | }) => {
  18  |   const cart = await store.cartWithItem(3)
  19  |   expect(cart.items).toHaveLength(1)
  20  |   expect(cart.items[0].quantity).toBe(3)
  21  |   expect(cart.item_subtotal).toBe(3 * seed.unitPrice)
  22  |   expect(cart.total).toBe(3 * seed.unitPrice)
  23  | })
  24  | test("API-009 R-CART updating quantity recalculates totals", async ({
  25  |   store,
  26  |   seed,
  27  | }) => {
  28  |   const cart = await store.cartWithItem()
  29  |   await jsonOk(
  30  |     await store.post(`/store/carts/${cart.id}/line-items/${cart.items[0].id}`, {
  31  |       quantity: 4,
  32  |     }),
  33  |   )
  34  |   const updated = await store.cart(cart.id)
  35  |   expect(updated.items[0].quantity).toBe(4)
  36  |   expect(updated.total).toBe(seed.unitPrice * 4)
  37  | })
  38  | test("API-010 R-CART removing the final item returns the cart to zero", async ({
  39  |   store,
  40  | }) => {
  41  |   const cart = await store.cartWithItem()
  42  |   await jsonOk(
  43  |     await store.delete(
  44  |       `/store/carts/${cart.id}/line-items/${cart.items[0].id}`,
  45  |     ),
  46  |   )
  47  |   const empty = await store.cart(cart.id)
  48  |   expect(empty.items).toHaveLength(0)
  49  |   expect(empty.total).toBe(0)
  50  | })
  51  | for (const quantity of [0, -1]) {
  52  |   test(`API-Q${quantity} R-INVENTORY rejects invalid add quantity ${quantity}`, async ({
  53  |     store,
  54  |   }) => {
  55  |     const cart = await store.createCart()
  56  |     const response = await store.post(`/store/carts/${cart.id}/line-items`, {
  57  |       variant_id: store.seed.variantId,
  58  |       quantity,
  59  |     })
  60  |     expect(response.status()).toBe(400)
  61  |     expect((await response.json()).message).toEqual(expect.any(String))
  62  |     expect((await store.cart(cart.id)).items).toHaveLength(0)
  63  |   })
  64  | }
  65  | test("API-013 R-INVENTORY fractional input must be rejected or preserved without silent coercion @product-bug", async ({
  66  |   store,
  67  |   seed,
  68  | }) => {
  69  |   const empty = await store.createCart()
  70  |   const response = await store.post(`/store/carts/${empty.id}/line-items`, {
  71  |     variant_id: seed.variantId,
  72  |     quantity: 1.5,
  73  |   })
  74  |   if (response.status() === 400) {
  75  |     expect((await store.cart(empty.id)).items).toHaveLength(0)
  76  |   } else {
  77  |     const { cart } = await jsonOk<{ cart: Cart }>(response)
  78  |     expect(
  79  |       cart.items[0].quantity,
  80  |       "CG-B001: accepted buyer quantity must not be silently rounded",
> 81  |     ).toBe(1.5)
      |       ^ Error: CG-B001: accepted buyer quantity must not be silently rounded
  82  |     expect(cart.total).toBe(seed.unitPrice * 1.5)
  83  |   }
  84  | })
  85  | test("API-014 R-INVENTORY stock overflow is rejected without cart changes", async ({
  86  |   store,
  87  |   seed,
  88  | }) => {
  89  |   const cart = await store.createCart()
  90  |   const response = await store.post(`/store/carts/${cart.id}/line-items`, {
  91  |     variant_id: seed.variantId,
  92  |     quantity: seed.stock + 1,
  93  |   })
  94  |   expect(response.status()).toBe(400)
  95  |   expect((await store.cart(cart.id)).items).toHaveLength(0)
  96  | })
  97  | test("API-015 R-ERROR missing variant is a validation error", async ({
  98  |   store,
  99  | }) => {
  100 |   const cart = await store.createCart()
  101 |   expect(
  102 |     (
  103 |       await store.post(`/store/carts/${cart.id}/line-items`, { quantity: 1 })
  104 |     ).status(),
  105 |   ).toBe(400)
  106 |   expect((await store.cart(cart.id)).total).toBe(0)
  107 | })
  108 | test("API-016 R-CART repeated add requests merge quantity rather than duplicate lines", async ({
  109 |   store,
  110 |   seed,
  111 | }) => {
  112 |   const cart = await store.cartWithItem()
  113 |   const { cart: updated } = await store.addItem(cart.id)
  114 |   expect(updated.items).toHaveLength(1)
  115 |   expect(updated.items[0].quantity).toBe(2)
  116 |   expect(updated.total).toBe(2 * seed.unitPrice)
  117 | })
  118 | test("API-017 R-PROMO ten percent promotion uses item subtotal @smoke", async ({
  119 |   store,
  120 |   seed,
  121 | }) => {
  122 |   const cart = await store.cartWithItem(3)
  123 |   const { cart: discounted } = await jsonOk<{ cart: Cart }>(
  124 |     await store.post(`/store/carts/${cart.id}/promotions`, {
  125 |       promo_codes: [seed.promotionCode],
  126 |     }),
  127 |   )
  128 |   expect(discounted.discount_total).toBe(3 * seed.unitPrice * 0.1)
  129 |   expect(discounted.total).toBe(3 * seed.unitPrice * 0.9)
  130 | })
  131 | test("API-018 R-PROMO applying the same promotion twice does not stack discounts", async ({
  132 |   store,
  133 |   seed,
  134 | }) => {
  135 |   const cart = await store.cartWithItem(2)
  136 |   for (let attempt = 0; attempt < 2; attempt++)
  137 |     await jsonOk(
  138 |       await store.post(`/store/carts/${cart.id}/promotions`, {
  139 |         promo_codes: [seed.promotionCode],
  140 |       }),
  141 |     )
  142 |   expect((await store.cart(cart.id)).discount_total).toBe(
  143 |     2 * seed.unitPrice * 0.1,
  144 |   )
  145 | })
  146 | test("API-019 R-PROMO unknown promotion grants no discount", async ({
  147 |   store,
  148 | }) => {
  149 |   const cart = await store.cartWithItem()
  150 |   await store.post(`/store/carts/${cart.id}/promotions`, {
  151 |     promo_codes: ["CG_DOES_NOT_EXIST"],
  152 |   })
  153 |   const updated = await store.cart(cart.id)
  154 |   expect(updated.discount_total).toBe(0)
  155 |   expect(updated.total).toBe(cart.total)
  156 | })
  157 | 
```