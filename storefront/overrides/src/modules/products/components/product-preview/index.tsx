import { getProductPrice } from "@lib/util/get-product-price"
import type { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import WishlistButton from "@modules/wishlist/button"

export default async function ProductPreview({
  product,
  isFeatured,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({ product })
  return (
    <div className="forme-card-shell">
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="forme-product-card group"
        aria-label={product.title}
      >
        <article data-testid="product-wrapper">
          <div className="forme-card-image">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              alt={product.title}
              size="full"
              isFeatured={isFeatured}
            />
            <span className="forme-card-tag">THE EVERYDAY EDIT</span>
            <span className="forme-card-arrow" aria-hidden="true">
              ↗
            </span>
          </div>
          <div className="forme-card-information">
            <div>
              <h3 data-testid="product-title">{product.title}</h3>
              <p>{product.subtitle || "An everyday essential"}</p>
            </div>
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </article>
      </LocalizedClientLink>
      <WishlistButton id={product.id} title={product.title} compact />
    </div>
  )
}
