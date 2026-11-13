import LocalizedClientLink from "@modules/common/components/localized-client-link"
export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="forme-checkout">
      <header className="forme-checkout-header content-container">
        <LocalizedClientLink
          href="/cart"
          className="forme-text-link"
          data-testid="back-to-cart-link"
        >
          <span aria-hidden="true">←</span> Back to bag
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/"
          className="forme-wordmark"
          data-testid="store-link"
        >
          FORME
          <span className="forme-wordmark-dot" />
        </LocalizedClientLink>
        <span className="forme-checkout-assurance">
          YOUR EDIT, ALMOST YOURS.
        </span>
      </header>
      <main id="main-content" tabIndex={-1}>
        <div className="forme-checkout-title content-container">
          <span className="forme-eyebrow">THE FINAL DETAILS</span>
          <h1>Make it yours.</h1>
        </div>
        <div data-testid="checkout-container">{children}</div>
      </main>
      <div className="forme-checkout-footnote content-container">
        CommerceGuard demonstration store · No real payments are taken.
      </div>
    </div>
  )
}
