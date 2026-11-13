import type { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
export default function ProductTabs({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  return (
    <div className="forme-product-tabs">
      <details>
        <summary>Product information</summary>
        <p>{product.description}</p>
        <p>Materials and fit describe the fictional demonstration catalog.</p>
      </details>
      <details>
        <summary>Shipping & returns</summary>
        <p>
          Available delivery options and their prices are calculated during
          checkout. This demonstration creates local order records; no payment
          is collected and no goods are dispatched.
        </p>
        <LocalizedClientLink href="/returns">
          About demonstration returns ↗
        </LocalizedClientLink>
      </details>
    </div>
  )
}
