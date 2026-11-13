"use server"
import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheTag, setCartId } from "./cookies"
import { getWishlistSession } from "./wishlist"
import { revalidateTag } from "next/cache"
import type { HttpTypes } from "@medusajs/types"

export async function buyAgain(orderId: string) {
  if (!/^order_[a-zA-Z0-9]+$/.test(orderId))
    return { error: "Choose a valid order." }
  const session = await getWishlistSession()
  if (!session.customerId)
    return { error: "Sign in to buy again from your order history." }
  const headers = await getAuthHeaders()
  try {
    const { order } = await sdk.client.fetch<{ order: HttpTypes.StoreOrder }>(
      `/store/orders/${orderId}`,
      { headers, cache: "no-store", query: { fields: "+customer_id,*items" } },
    )
    if (order.customer_id !== session.customerId)
      return { error: "This order is not available in your account." }
    const items = (order.items || []).map((item) => ({
      variant_id: item.variant_id,
      quantity: Number(item.quantity),
    }))
    if (
      !items.length ||
      items.some(
        (item) =>
          !item.variant_id ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > 10,
      )
    )
      return {
        error:
          "Some original items cannot be reordered. Choose available pieces from the collection.",
      }
    // The real cart workflow validates current inventory and prices. Switch the
    // browser's bag only after every item succeeds; never copy old prices/promos.
    const { cart } = await sdk.store.cart.create(
      {
        region_id: order.region_id,
        items: items as { variant_id: string; quantity: number }[],
      },
      {},
      headers,
    )
    await setCartId(cart.id)
    revalidateTag(await getCacheTag("carts"), { expire: 0 })
    return { cartId: cart.id }
  } catch {
    return {
      error:
        "One or more pieces are unavailable. Your existing bag has been kept. Please check the collection.",
    }
  }
}
