import LocalizedClientLink from "@modules/common/components/localized-client-link"
export default function EmptyCartMessage() {
  return (
    <div className="forme-empty-cart" data-testid="empty-cart-message">
      <span className="forme-empty-symbol" aria-hidden="true">
        ↗
      </span>
      <h2>
        A little room
        <br />
        for something good.
      </h2>
      <p>Your bag is empty. Find an everyday piece that feels like you.</p>
      <LocalizedClientLink href="/store" className="forme-button">
        Explore the collection <span aria-hidden="true">↗</span>
      </LocalizedClientLink>
    </div>
  )
}
