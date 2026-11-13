"use client"

import type { Hit } from "instantsearch.js"
import { useEffect, useRef } from "react"
import { useHits, useInstantSearch } from "react-instantsearch"

import useSearchSettled from "@lib/hooks/use-search-settled"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text } from "@modules/common/components/ui"
import Thumbnail from "@modules/products/components/thumbnail"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import SearchPagination from "./pagination"
import HitPrice, { HitPricing } from "./price"
import WishlistButton from "@modules/wishlist/button"

type ProductHit = Hit<
  {
    title: string | null
    handle: string | null
    thumbnail: string | null
    subtitle?: string | null
  } & HitPricing
>

type StoreHitsProps = {
  hitsPerPage: number
  currencyCode: string
}

const StoreHits = ({ hitsPerPage, currencyCode }: StoreHitsProps) => {
  const { items } = useHits<ProductHit>()
  const { status, error, indexUiState } = useInstantSearch()
  const { isSearching, hasNoResultsYet } = useSearchSettled()

  const { page, ...refinements } = indexUiState
  const currentPage = page ?? 1
  const refinementKey = JSON.stringify(refinements)

  const settled = useRef({ page: currentPage, refinementKey })

  useEffect(() => {
    if (!isSearching) {
      settled.current = { page: currentPage, refinementKey }
    }
  }, [isSearching, currentPage, refinementKey])

  const isPagingOnly =
    refinementKey === settled.current.refinementKey &&
    currentPage !== settled.current.page

  const showSkeleton = hasNoResultsYet || (isSearching && isPagingOnly)

  if (status === "error") {
    return (
      <Text
        className="py-16 text-center text-ui-fg-error"
        data-testid="products-error"
      >
        Couldn&apos;t load products
        {error?.message ? `: ${error.message}` : "."}
      </Text>
    )
  }

  return (
    <>
      {showSkeleton ? (
        <SkeletonProductGrid numberOfProducts={hitsPerPage} />
      ) : !items.length ? (
        <Text
          className="py-16 text-center text-ui-fg-subtle"
          data-testid="no-products"
        >
          No products matched these filters.
        </Text>
      ) : (
        <ul
          className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
          data-testid="products-list"
        >
          {items.map((hit) =>
            hit.handle ? (
              <li key={hit.objectID} className="forme-card-shell">
                <LocalizedClientLink
                  href={`/products/${hit.handle}`}
                  className="forme-product-card group"
                  aria-label={hit.title ?? "View product"}
                >
                  <article data-testid="product-wrapper">
                    <div className="forme-card-image">
                      <Thumbnail
                        thumbnail={hit.thumbnail}
                        alt={hit.title ?? "Product"}
                        size="full"
                      />
                      <span className="forme-card-tag">THE EVERYDAY EDIT</span>
                      <span className="forme-card-arrow" aria-hidden="true">
                        ↗
                      </span>
                    </div>
                    <div className="forme-card-information">
                      <div>
                        <h3 data-testid="product-title">{hit.title}</h3>
                        {hit.subtitle && <p>{hit.subtitle}</p>}
                      </div>
                      <HitPrice hit={hit} currencyCode={currencyCode} />
                    </div>
                  </article>
                </LocalizedClientLink>
                <WishlistButton
                  id={hit.objectID}
                  title={hit.title ?? "Product"}
                  compact
                />
              </li>
            ) : null,
          )}
        </ul>
      )}
      <SearchPagination />
    </>
  )
}

export default StoreHits
