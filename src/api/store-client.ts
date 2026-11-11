import {
  expect,
  type APIRequestContext,
  type APIResponse,
} from "@playwright/test"
import { z } from "zod"
import { type Seed } from "../config.js"
import { address, customerData } from "../data/factories.js"

export const cartSchema = z
  .object({
    id: z.string().startsWith("cart_"),
    currency_code: z.string(),
    region_id: z.string(),
    total: z.number(),
    subtotal: z.number(),
    item_subtotal: z.number(),
    discount_total: z.number(),
    tax_total: z.number(),
    shipping_total: z.number(),
    items: z.array(
      z
        .object({
          id: z.string(),
          variant_id: z.string(),
          quantity: z.number(),
          unit_price: z.number(),
        })
        .passthrough(),
    ),
  })
  .passthrough()
export type Cart = z.infer<typeof cartSchema>
export type Order = {
  id: string
  customer_id: string | null
  total: number
  items: {
    id: string
    quantity: number
    variant_id: string
    unit_price: number
  }[]
}

export async function jsonOk<T>(
  response: APIResponse,
  status = 200,
): Promise<T> {
  expect(response.status(), `${response.url()}: ${await response.text()}`).toBe(
    status,
  )
  return response.json() as Promise<T>
}
export class StoreClient {
  constructor(
    readonly request: APIRequestContext,
    readonly seed: Seed,
    readonly token?: string,
  ) {}
  get headers() {
    return {
      "x-publishable-api-key": this.seed.publishableKey,
      ...(this.token ? { authorization: `Bearer ${this.token}` } : {}),
    }
  }
  get(path: string) {
    return this.request.get(path, { headers: this.headers })
  }
  post(path: string, data: unknown) {
    return this.request.post(path, { headers: this.headers, data })
  }
  delete(path: string) {
    return this.request.delete(path, { headers: this.headers })
  }
  async createCart(data: Record<string, unknown> = {}): Promise<Cart> {
    const body = await jsonOk<{ cart: unknown }>(
      await this.post("/store/carts", {
        region_id: this.seed.regionId,
        ...data,
      }),
    )
    return cartSchema.parse(body.cart)
  }
  async cart(id: string): Promise<Cart> {
    const body = await jsonOk<{ cart: unknown }>(
      await this.get(`/store/carts/${id}`),
    )
    return cartSchema.parse(body.cart)
  }
  async addItem(id: string, quantity = 1, variantId = this.seed.variantId) {
    return jsonOk<{ cart: Cart }>(
      await this.post(`/store/carts/${id}/line-items`, {
        variant_id: variantId,
        quantity,
      }),
    )
  }
  async cartWithItem(quantity = 1) {
    const cart = await this.createCart()
    return (await this.addItem(cart.id, quantity)).cart
  }
  async customer() {
    const data = customerData()
    const registered = await jsonOk<{ token: string }>(
      await this.post("/auth/customer/emailpass/register", {
        email: data.email,
        password: data.password,
      }),
    )
    const pending = new StoreClient(this.request, this.seed, registered.token)
    const { customer } = await jsonOk<{
      customer: { id: string; email: string }
    }>(
      await pending.post("/store/customers", {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
      }),
    )
    const login = await jsonOk<{ token: string }>(
      await this.post("/auth/customer/emailpass", {
        email: data.email,
        password: data.password,
      }),
    )
    expect(login.token).toEqual(expect.any(String))
    return {
      ...data,
      id: customer.id,
      token: login.token,
      client: new StoreClient(this.request, this.seed, login.token),
    }
  }
  async readyForCheckout(cartId: string, email = customerData().email) {
    await jsonOk(
      await this.post(`/store/carts/${cartId}`, {
        email,
        shipping_address: address(),
        billing_address: address(),
      }),
    )
    const { shipping_options } = await jsonOk<{
      shipping_options: { id: string; name: string }[]
    }>(await this.get(`/store/shipping-options?cart_id=${cartId}`))
    const shipping = shipping_options.find(
      (option) => option.name === "Standard Shipping",
    )
    expect(shipping, "Seeded Standard Shipping must be eligible").toBeDefined()
    await jsonOk(
      await this.post(`/store/carts/${cartId}/shipping-methods`, {
        option_id: shipping!.id,
      }),
    )
    const { payment_collection } = await jsonOk<{
      payment_collection: { id: string }
    }>(await this.post("/store/payment-collections", { cart_id: cartId }))
    await jsonOk(
      await this.post(
        `/store/payment-collections/${payment_collection.id}/payment-sessions`,
        { provider_id: "pp_system_default" },
      ),
    )
    return this.cart(cartId)
  }
  async complete(cartId: string) {
    const result = await jsonOk<{
      type: string
      order: Order
      error?: unknown
    }>(await this.post(`/store/carts/${cartId}/complete`, {}))
    expect(result.type, JSON.stringify(result.error)).toBe("order")
    return result.order
  }
}
