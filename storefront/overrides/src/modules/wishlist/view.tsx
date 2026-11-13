"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import type { HttpTypes } from "@medusajs/types"
import { getWishlistProducts } from "@lib/data/wishlist"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useWishlist } from "./provider"
import WishlistButton from "./button"

export default function WishlistView() {
  const { ids, customerId, busy } = useWishlist()
  const { countryCode } = useParams<{ countryCode: string }>()
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const [error, setError] = useState("")
  const productKey = ids.join(",")
  const requestKey = `${countryCode}:${productKey}`
  const loading = loadedKey !== requestKey
  useEffect(() => {
    if (busy) return
    let active = true
    getWishlistProducts(productKey ? productKey.split(",") : [], countryCode)
      .then((items) => {
        if (active) {
          setProducts(items)
          setError("")
        }
      })
      .catch(() => {
        if (active)
          setError("Your products could not load. Refresh to try again.")
      })
      .finally(() => {
        if (active) setLoadedKey(requestKey)
      })
    return () => {
      active = false
    }
  }, [productKey, countryCode, busy, requestKey])
  return (
    <section
      className="content-container forme-wishlist"
      aria-labelledby="wishlist-heading"
    >
      <span className="forme-eyebrow">A LITTLE ROOM FOR LATER</span>
      <h1 id="wishlist-heading">Your wishlist.</h1>
      <p>
        {customerId
          ? "Saved to your account. Come back whenever you like."
          : "Saved on this browser. Sign in to keep these pieces in your account."}
      </p>
      {!customerId && (
        <LocalizedClientLink href="/account" className="forme-text-link">
          Sign in to keep your wishlist ↗
        </LocalizedClientLink>
      )}
      {error && <p role="alert">{error}</p>}
      {loading || busy ? (
        <p role="status">Loading your saved pieces…</p>
      ) : !ids.length ? (
        <div className="forme-empty-wishlist">
          <h2>Something will catch your eye.</h2>
          <p>Use the heart on a product to save it here.</p>
          <LocalizedClientLink href="/store" className="forme-button">
            Explore the collection ↗
          </LocalizedClientLink>
        </div>
      ) : (
        <>
          {products.length < ids.length && (
            <p role="status">
              Some saved products are no longer available in this region.
            </p>
          )}
          <ul className="forme-wishlist-grid">
            {products.map((product) => (
              <li key={product.id} className="forme-card-shell">
                <LocalizedClientLink
                  href={`/products/${product.handle}`}
                  className="forme-product-card"
                  aria-label={product.title}
                >
                  <Image
                    unoptimized
                    src={product.thumbnail || "/forme/tee.webp"}
                    alt={product.title}
                    width="600"
                    height="750"
                  />
                  <h2>{product.title}</h2>
                  <p>
                    {
                      getProductPrice({ product }).cheapestPrice
                        ?.calculated_price
                    }
                  </p>
                </LocalizedClientLink>
                <WishlistButton id={product.id} title={product.title} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
