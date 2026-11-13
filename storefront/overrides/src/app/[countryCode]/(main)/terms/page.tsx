import type { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
export const metadata: Metadata = { title: "Terms" }
export default function Page() {
  return (
    <section className="content-container forme-policy">
      <span className="forme-eyebrow">TERMS OF USE</span>
      <h1>A considered demonstration.</h1>
      <div>
        <p>
          FORME is a fictional apparel storefront created for the CommerceGuard
          QA portfolio. The catalog imagery is illustrative and does not depict
          inventory for sale.
        </p>
        <p>
          Orders are demonstrations only. No real payment is collected and no
          goods are dispatched. Use invented account and address details while
          exploring the store.
        </p>
      </div>
      <LocalizedClientLink href="/store" className="forme-text-link">
        Explore the collection <span aria-hidden="true">↗</span>
      </LocalizedClientLink>
    </section>
  )
}
