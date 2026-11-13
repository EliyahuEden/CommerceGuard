import type { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
export const metadata: Metadata = { title: "Returns" }
export default function Page() {
  return (
    <section className="content-container forme-policy">
      <span className="forme-eyebrow">YOUR ORDER</span>
      <h1>Returns, considered.</h1>
      <div>
        <p>
          This is a demonstration store. There are no physical deliveries or
          returns.
        </p>
        <p>
          You can review demonstration orders in your account. If you are
          exploring checkout, use invented details and the available test
          payment option.
        </p>
      </div>
      <LocalizedClientLink href="/store" className="forme-text-link">
        Explore the collection <span aria-hidden="true">↗</span>
      </LocalizedClientLink>
    </section>
  )
}
