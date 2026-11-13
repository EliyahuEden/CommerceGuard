import Image from "next/image"
import type { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
export const metadata: Metadata = { title: "Our approach" }
export default function About() {
  return (
    <div className="content-container forme-about">
      <span className="forme-eyebrow">THE FORME APPROACH</span>
      <h1>
        A little less.
        <br />
        <em>A little better.</em>
      </h1>
      <div className="forme-editorial">
        <div className="forme-editorial-image">
          <Image
            src="/forme/editorial-detail.webp"
            alt="A considered edit of folded everyday essentials"
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="forme-editorial-copy">
          <h2>Room for the everyday.</h2>
          <p>
            FORME is a small, considered edit of familiar shapes. T-shirts,
            sweatshirts, sweatpants, and shorts. Pieces that work together, with
            space for your own point of view.
          </p>
          <p>
            This is a fictional storefront created for the CommerceGuard QA
            engineering project. You can explore real cart, account, and
            test-checkout workflows. No real payments are taken.
          </p>
          <LocalizedClientLink href="/store" className="forme-text-link">
            Explore the collection <span aria-hidden="true">↗</span>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
