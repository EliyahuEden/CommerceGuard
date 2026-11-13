import { Suspense } from "react"
import type { HttpTypes } from "@medusajs/types"
import { notFound } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import VariantImageGallery from "@modules/products/components/image-gallery/variant-image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import WishlistButton from "@modules/wishlist/button"
import ProductDetails from "@modules/products/components/forme-details"
export default function ProductTemplate({
  product,
  region,
  countryCode,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  if (!product?.id) return notFound()
  return (
    <>
      <div
        className="content-container forme-product-page"
        data-testid="product-container"
      >
        <nav className="forme-breadcrumb" aria-label="Breadcrumb">
          <LocalizedClientLink href="/store">
            The collection
          </LocalizedClientLink>
          <span aria-hidden="true">/</span>
          <span>{product.title}</span>
        </nav>
        <div className="forme-product-layout">
          <div className="forme-product-gallery">
            <VariantImageGallery product={product} />
          </div>
          <div className="forme-product-details">
            <span className="forme-eyebrow">THE EVERYDAY EDIT / 01</span>
            <ProductInfo product={product} />
            <ProductActions product={product} region={region} />
            <WishlistButton id={product.id} title={product.title} />
            <ProductDetails product={product} />
            <div className="forme-product-reassurance">
              <span>Live stock availability</span>
              <span>Delivery options at checkout</span>
            </div>
            <ProductTabs product={product} />
          </div>
        </div>
      </div>
      <div
        className="content-container forme-related"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}
