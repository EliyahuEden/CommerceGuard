import type { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
export const metadata: Metadata = { title: "Contact" }
export default function Page() {
  return (
    <section className="content-container forme-policy">
      <span className="forme-eyebrow">GET IN TOUCH</span>
      <h1>Here to help.</h1>
      <div>
        <p>
          FORME is a demonstration store. No purchases are fulfilled and no
          customer support service is operated.
        </p>
        <p>
          You can explore the collection, try the checkout, and manage your
          demonstration account. Your orders are available in your account.
        </p>
      </div>
      <LocalizedClientLink href="/store" className="forme-text-link">
        Explore the collection <span aria-hidden="true">↗</span>
      </LocalizedClientLink>
    </section>
  )
}
