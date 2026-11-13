"use client"
import type { SearchClient } from "instantsearch.js"
import { history } from "instantsearch.js/es/lib/routers"
import { useMemo } from "react"
import { Configure, InstantSearch } from "react-instantsearch"
import { PRODUCT_INDEX_NAME, searchClient } from "@lib/search-client"
import StoreHits from "@modules/store/components/store-hits"
import StoreRefinements from "@modules/store/components/store-refinements"
import CollectionLinks from "@modules/store/components/forme-collections"
import StoreSearchBox from "@modules/store/components/store-search-box"
export default function StoreTemplate({
  currencyCode,
}: {
  currencyCode: string
}) {
  // Cleaning the search URL on unmount can overwrite Next.js navigation to an
  // account or product page. Preserve that destination while retaining filters.
  const routing = useMemo(
    () => ({ router: history({ cleanUrlOnDispose: false }) }),
    [],
  )
  return (
    <div
      className="content-container forme-store"
      data-testid="category-container"
    >
      <div className="forme-store-heading">
        <span className="forme-eyebrow">THE FORME COLLECTION</span>
        <h1 data-testid="store-page-title">All products</h1>
        <p>A small edit. Everyday possibilities.</p>
        <CollectionLinks />
      </div>
      <InstantSearch
        indexName={PRODUCT_INDEX_NAME}
        searchClient={searchClient as unknown as SearchClient}
        routing={routing}
        future={{ preserveSharedStateOnUnmount: true }}
      >
        <Configure hitsPerPage={12} />
        <div className="forme-store-layout">
          <StoreRefinements currencyCode={currencyCode} />
          <div className="forme-store-results">
            <StoreSearchBox />
            <StoreHits hitsPerPage={12} currencyCode={currencyCode} />
          </div>
        </div>
      </InstantSearch>
    </div>
  )
}
