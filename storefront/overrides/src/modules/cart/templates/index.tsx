import type { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
export default function CartTemplate({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  const quantity =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  return (
    <div
      className="content-container forme-cart-page"
      data-testid="cart-container"
    >
      <div className="forme-page-heading">
        <span className="forme-eyebrow">YOUR EVERYDAY EDIT</span>
        <h1>
          Your bag<span className="forme-count">{quantity}</span>
        </h1>
        <LocalizedClientLink href="/store" className="forme-text-link">
          Continue exploring <span aria-hidden="true">↗</span>
        </LocalizedClientLink>
      </div>
      {cart?.items?.length ? (
        <div className="forme-cart-layout">
          <div>
            <ItemsTemplate cart={cart} />
            {!customer && (
              <div className="forme-cart-signin">
                <SignInPrompt />
              </div>
            )}
          </div>
          <aside className="forme-cart-summary">
            <Summary cart={cart} />
            <p className="forme-demo-note">
              Demonstration checkout. No real payment is taken.
            </p>
          </aside>
        </div>
      ) : (
        <EmptyCartMessage />
      )}
    </div>
  )
}
