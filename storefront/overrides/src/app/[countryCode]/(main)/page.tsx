import type { Metadata } from "next"
import Image from "next/image"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

export const dynamic = "force-static"
export const revalidate = 60
export const metadata: Metadata = {
  title: "Everyday, considered",
  description:
    "A considered wardrobe starts with the essentials. Explore the FORME everyday collection.",
}

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const [
    region,
    {
      response: { products },
    },
  ] = await Promise.all([
    getRegion(countryCode),
    listProducts({
      countryCode,
      queryParams: { limit: 4, order: "created_at" },
    }),
  ])
  return (
    <>
      <section
        className="forme-hero"
        aria-labelledby="hero-heading"
        data-testid="home-hero"
      >
        <div className="forme-hero-image">
          <Image
            src="/forme/campaign-hero.webp"
            alt="A black cotton tee styled against sunlit limestone architecture"
            fill
            priority
            sizes="(max-width: 767px) 100vw, 64vw"
          />
        </div>
        <div className="forme-hero-copy">
          <span className="forme-eyebrow">
            <span /> THE EVERYDAY EDIT / 01
          </span>
          <h1 id="hero-heading">
            Everyday,
            <br />
            <em>considered.</em>
          </h1>
          <p>
            Good pieces. Easy days.
            <br />
            Essentials that feel like you.
          </p>
          <LocalizedClientLink
            href="/store"
            className="forme-button"
            data-testid="home-shop-button"
          >
            Explore the collection <span aria-hidden="true">↗</span>
          </LocalizedClientLink>
          <div className="forme-hero-footnote">
            <span className="forme-small-rule" /> LESS, BUT CONSIDERED.
          </div>
        </div>
        <span className="forme-hero-caption">FORM / FUNCTION / EVERYDAY</span>
      </section>
      <div className="forme-values-strip">
        <span>Considered silhouettes</span>
        <span aria-hidden="true">✳</span>
        <span>Easy to wear. Easy to pair.</span>
        <span aria-hidden="true">✳</span>
        <span>Your everyday uniform</span>
      </div>
      <section
        className="forme-collection content-container"
        id="the-edit"
        aria-labelledby="collection-heading"
      >
        <div className="forme-section-heading">
          <div>
            <span className="forme-eyebrow">
              THE FOUNDATION OF YOUR WARDROBE
            </span>
            <h2 id="collection-heading">The everyday essentials.</h2>
          </div>
          <LocalizedClientLink href="/store" className="forme-text-link">
            View the collection <span aria-hidden="true">↗</span>
          </LocalizedClientLink>
        </div>
        <div className="forme-home-products" data-testid="home-products">
          {region &&
            products.map((product, index) => (
              <div
                key={product.id}
                className="forme-card-entrance"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <ProductPreview product={product} region={region} />
              </div>
            ))}
        </div>
        <nav className="forme-collection-links" aria-label="Shop by collection">
          <LocalizedClientLink href="/collections/everyday-essentials">
            Everyday essentials <span aria-hidden="true">↗</span>
          </LocalizedClientLink>
          <LocalizedClientLink href="/collections/off-duty">
            Off duty <span aria-hidden="true">↗</span>
          </LocalizedClientLink>
          <LocalizedClientLink href="/collections/considered-layers">
            Considered layers <span aria-hidden="true">↗</span>
          </LocalizedClientLink>
        </nav>
      </section>
      <section
        className="forme-editorial content-container"
        aria-labelledby="approach-heading"
      >
        <div className="forme-editorial-image">
          <Image
            src="/forme/editorial-detail.webp"
            alt="Folded everyday cotton essentials on warm travertine"
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
          />
        </div>
        <div className="forme-editorial-copy">
          <span className="forme-eyebrow">A WARDROBE, SIMPLIFIED.</span>
          <h2 id="approach-heading">
            Fewer decisions.
            <br />
            <em>More you.</em>
          </h2>
          <p>
            Some pieces just belong. The tee that works with everything. The
            layer you leave by the door. The shape that feels right.
          </p>
          <p>
            We bring them together. A small edit, with room to make it your own.
          </p>
          <LocalizedClientLink href="/about" className="forme-text-link">
            Our approach <span aria-hidden="true">↗</span>
          </LocalizedClientLink>
        </div>
      </section>
      <section className="forme-bottom-note content-container">
        <span className="forme-eyebrow">FIND YOUR EVERYDAY</span>
        <h2>Wear it your way.</h2>
        <LocalizedClientLink
          href="/store"
          className="forme-button forme-button-outline"
        >
          Discover your next essential <span aria-hidden="true">↗</span>
        </LocalizedClientLink>
      </section>
    </>
  )
}
