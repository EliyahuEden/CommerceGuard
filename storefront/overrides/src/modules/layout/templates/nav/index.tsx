import { Suspense } from "react"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import Search from "@modules/layout/components/search"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions(),
    listLocales(),
    getLocale(),
  ])
  return (
    <div className="forme-header-shell">
      <div className="forme-announcement">
        A little less. A little better.{" "}
        <LocalizedClientLink href="/store">
          Discover the everyday edit <span aria-hidden="true">↗</span>
        </LocalizedClientLink>
      </div>
      <header className="forme-header content-container">
        <div className="forme-header-brand">
          <div className="forme-mobile-only">
            <SideMenu
              regions={regions}
              locales={locales}
              currentLocale={currentLocale}
            />
          </div>
          <LocalizedClientLink
            href="/"
            className="forme-wordmark"
            data-testid="nav-store-link"
            aria-label="FORME home"
          >
            FORME
            <span className="forme-wordmark-dot" />
          </LocalizedClientLink>
        </div>
        <nav aria-label="Main navigation" className="forme-desktop-nav">
          <LocalizedClientLink href="/store">Shop all</LocalizedClientLink>
          <LocalizedClientLink href="/categories/shirts">
            The essentials
          </LocalizedClientLink>
          <LocalizedClientLink href="/about">Our approach</LocalizedClientLink>
        </nav>
        <div className="forme-header-actions">
          <Search />
          <LocalizedClientLink
            href="/wishlist"
            aria-label="Wishlist"
            className="forme-nav-wishlist"
          >
            <svg
              aria-hidden="true"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
            </svg>
          </LocalizedClientLink>
          <LocalizedClientLink
            className="forme-account-link"
            href="/account"
            data-testid="nav-account-link"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="19"
              height="19"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <circle cx="12" cy="8" r="3.4" />
              <path d="M5.5 21v-2.5a6.5 6.5 0 0 1 13 0V21" />
            </svg>
            <span className="forme-desktop-only">Account</span>
            <span className="sr-only forme-mobile-only">Account</span>
          </LocalizedClientLink>
          <Suspense
            fallback={
              <LocalizedClientLink href="/cart" data-testid="nav-cart-link">
                Cart (0)
              </LocalizedClientLink>
            }
          >
            <CartButton />
          </Suspense>
        </div>
      </header>
    </div>
  )
}
