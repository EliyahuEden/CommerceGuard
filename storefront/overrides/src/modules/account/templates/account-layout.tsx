import type { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AccountNav from "../components/account-nav"
import WishlistSessionObserver from "@modules/wishlist/session-observer"
export default function AccountLayout({
  customer,
  children,
}: {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}) {
  return (
    <div
      className={`content-container forme-account-page ${customer ? "forme-account-signed-in" : "forme-account-guest"}`}
      data-testid="account-page"
    >
      <WishlistSessionObserver customerId={customer?.id || null} />
      {customer ? (
        <>
          <div className="forme-page-heading">
            <span className="forme-eyebrow">YOUR CORNER OF FORME</span>
            <h1>Good to see you.</h1>
          </div>
          <div className="forme-account-grid">
            <AccountNav customer={customer} />
            <div>{children}</div>
          </div>
        </>
      ) : (
        <div className="forme-account-welcome">
          <div className="forme-account-intro">
            <span className="forme-eyebrow">A PLACE FOR YOUR EVERYDAY</span>
            <h2>
              Make yourself
              <br />
              <em>at home.</em>
            </h2>
            <p>
              Your details, your orders, and the pieces
              <br />
              you’ll come back to.
            </p>
            <LocalizedClientLink href="/store" className="forme-text-link">
              Explore the collection <span aria-hidden="true">↗</span>
            </LocalizedClientLink>
          </div>
          <div className="forme-account-form">{children}</div>
        </div>
      )}
      <div className="forme-account-help">
        <p>A question about your order?</p>
        <LocalizedClientLink href="/contact" className="forme-text-link">
          We’re here to help <span aria-hidden="true">↗</span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
