"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"
import { updateCustomer } from "./customer"
import { listProducts } from "./products"
import type { HttpTypes } from "@medusajs/types"
import { FetchError } from "@medusajs/js-sdk"

function ids(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return Array.from(
    new Set(
      value.filter(
        (id): id is string =>
          typeof id === "string" && /^prod_[a-zA-Z0-9]+$/.test(id),
      ),
    ),
  ).slice(0, 100)
}

export async function getWishlistSession() {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers))
    return { customerId: null, ids: [] as string[] }
  try {
    const { customer } = await sdk.client.fetch<{
      customer: HttpTypes.StoreCustomer
    }>("/store/customers/me", { headers, cache: "no-store" })
    return {
      customerId: customer.id,
      ids: ids(customer.metadata?.forme_wishlist),
    }
  } catch (error) {
    if (error instanceof FetchError && error.status === 401)
      return { customerId: null, ids: [] as string[] }
    throw error
  }
}

export async function saveWishlist(value: string[]) {
  const session = await getWishlistSession()
  if (!session.customerId)
    throw new Error("Sign in to save your wishlist to an account.")
  if (
    !Array.isArray(value) ||
    value.length > 100 ||
    ids(value).length !== value.length
  )
    throw new Error("Choose up to 100 valid products.")
  // Authentication comes exclusively from the HttpOnly session. No customer ID
  // supplied by the browser can select another customer's metadata.
  await updateCustomer({ metadata: { forme_wishlist: value } })
  return { customerId: session.customerId, ids: value }
}

export async function getWishlistProducts(
  value: string[],
  countryCode: string,
) {
  const productIds = ids(value)
  if (!productIds.length) return []
  if (!/^[a-z]{2}$/.test(countryCode))
    throw new Error("Choose a valid store region.")
  const { response } = await listProducts({
    countryCode,
    queryParams: { id: productIds, limit: 100 },
  })
  return response.products
}
