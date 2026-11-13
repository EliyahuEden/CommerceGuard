import type { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
export const metadata: Metadata = { title: "Privacy" }
export default function Page() {
  return (
    <section className="content-container forme-policy">
      <span className="forme-eyebrow">PRIVACY</span>
      <h1>Your details.</h1>
      <div>
        <p>
          Use invented details when exploring this demonstration. Account,
          address, cart, and order information entered here is stored in the
          local demonstration database.
        </p>
        <p>
          The store uses cookies to keep your cart, region, and signed-in
          session. No real payments are taken. This page describes the
          demonstration and is not a production privacy policy.
        </p>
      </div>
      <LocalizedClientLink href="/store" className="forme-text-link">
        Explore the collection <span aria-hidden="true">↗</span>
      </LocalizedClientLink>
    </section>
  )
}
