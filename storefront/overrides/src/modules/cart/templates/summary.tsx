"use client"
import type { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import CartTotals from "@modules/common/components/cart-totals"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
export default function Summary({ cart }: { cart: HttpTypes.StoreCart }) {
  const step =
    !cart.shipping_address?.address_1 || !cart.email
      ? "address"
      : !cart.shipping_methods?.length
        ? "delivery"
        : "payment"
  return (
    <div className="forme-summary-content">
      <h2>Order summary</h2>
      <CartTotals totals={cart} />
      <DiscountCode cart={cart} />
      <LocalizedClientLink
        href={`/checkout?step=${step}`}
        data-testid="checkout-button"
      >
        <Button className="w-full">
          Continue to checkout <span aria-hidden="true">↗</span>
        </Button>
      </LocalizedClientLink>
      <p className="forme-small-note">
        Shipping and taxes calculated at checkout.
      </p>
    </div>
  )
}
