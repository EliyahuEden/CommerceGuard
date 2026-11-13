"use client"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { buyAgain } from "@lib/data/buy-again"
import { useWishlist } from "@modules/wishlist/provider"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function OrderExperience({
  order,
}: {
  order: HttpTypes.StoreOrder
}) {
  const { customerId, busy: sessionBusy } = useWishlist()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { countryCode } = useParams<{ countryCode: string }>()
  const payment = order.payment_status.replaceAll("_", " ")
  const fulfillment = order.fulfillment_status.replaceAll("_", " ")
  return (
    <section
      className="forme-order-experience"
      aria-labelledby="order-status-heading"
    >
      <h2 id="order-status-heading">Your order, at a glance.</h2>
      <dl className="forme-order-status">
        <div>
          <dt>Order</dt>
          <dd>{order.status.replaceAll("_", " ")}</dd>
        </div>
        <div>
          <dt>Payment</dt>
          <dd data-testid="order-payment-status">{payment}</dd>
        </div>
        <div>
          <dt>Fulfillment</dt>
          <dd data-testid="order-fulfillment-status">{fulfillment}</dd>
        </div>
      </dl>
      <p className="forme-note">
        Demonstration order. No money is collected, no email is sent and no
        goods are dispatched. Statuses above come from the local commerce
        system.
      </p>
      <div className="forme-order-actions">
        {customerId ? (
          <button
            type="button"
            className="forme-button"
            disabled={pending || sessionBusy}
            onClick={async () => {
              setPending(true)
              setError("")
              try {
                const result = await buyAgain(order.id)
                if (result.error) setError(result.error)
                else {
                  router.push(`/${countryCode}/cart`)
                  router.refresh()
                }
              } catch {
                setError("We could not prepare your bag. Please try again.")
              } finally {
                setPending(false)
              }
            }}
          >
            {pending ? "Preparing your bag…" : "Buy again ↗"}
          </button>
        ) : (
          <LocalizedClientLink href="/account" className="forme-text-link">
            Sign in to buy again ↗
          </LocalizedClientLink>
        )}
        <LocalizedClientLink href="/store" className="forme-text-link">
          Continue exploring ↗
        </LocalizedClientLink>
      </div>
      <p className="forme-note">
        Buy again prepares a new bag with today’s prices and stock. Discounts
        and delivery selections are chosen again at checkout.
      </p>
      {error && (
        <p role="alert" className="forme-form-error">
          {error}
        </p>
      )}
    </section>
  )
}
