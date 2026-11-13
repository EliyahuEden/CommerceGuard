import { formeCollections } from "@lib/forme-collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Footer() {
  return (
    <footer className="forme-footer">
      <div className="content-container">
        <div className="forme-footer-top">
          <div>
            <LocalizedClientLink href="/" className="forme-wordmark">
              FORME
              <span className="forme-wordmark-dot" />
            </LocalizedClientLink>
            <p>
              For the way you move.
              <br />
              For the everyday.
            </p>
          </div>
          <div className="forme-footer-links">
            <div>
              <h2>The collection</h2>
              <LocalizedClientLink href="/store">Shop all</LocalizedClientLink>
              {formeCollections.map((collection) => (
                <LocalizedClientLink
                  key={collection.handle}
                  href={`/collections/${collection.handle}`}
                >
                  {collection.title}
                </LocalizedClientLink>
              ))}
            </div>
            <div>
              <h2>Here to help</h2>
              <LocalizedClientLink href="/account">
                My account
              </LocalizedClientLink>
              <LocalizedClientLink href="/shipping">
                Shipping
              </LocalizedClientLink>
              <LocalizedClientLink href="/returns">Returns</LocalizedClientLink>
              <LocalizedClientLink href="/contact">Contact</LocalizedClientLink>
            </div>
            <div>
              <h2>Considered by design</h2>
              <LocalizedClientLink href="/about">
                Our approach
              </LocalizedClientLink>
              <LocalizedClientLink href="/privacy">Privacy</LocalizedClientLink>
              <LocalizedClientLink href="/terms">Terms</LocalizedClientLink>
            </div>
          </div>
        </div>
        <div className="forme-footer-bottom">
          <span>
            © {new Date().getFullYear()} FORME. A CommerceGuard demonstration
            store.
          </span>
          <span>
            Powered by{" "}
            <a href="https://medusajs.com" target="_blank" rel="noreferrer">
              Medusa
            </a>{" "}
            · Designed for everyday.
          </span>
        </div>
      </div>
    </footer>
  )
}
