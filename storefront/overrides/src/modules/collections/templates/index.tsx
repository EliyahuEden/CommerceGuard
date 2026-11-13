import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { formeCollections } from "@lib/forme-collections"
import CollectionLinks from "@modules/store/components/forme-collections"
export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  optionValueIds,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const edit = formeCollections.find(
    (item) => item.handle === collection.handle,
  )
  return (
    <div className="content-container forme-store">
      <header className="forme-store-heading">
        <span className="forme-eyebrow">THE FORME COLLECTION</span>
        <h1>{collection.title}</h1>
        <p>{edit?.description || "A considered edit for your everyday."}</p>
        <CollectionLinks current={collection.handle} />
      </header>
      <div className="forme-store-layout">
        <aside
          className="forme-collection-sort"
          aria-label="Collection sorting"
        >
          <RefinementList sortBy={sortBy || "created_at"} hideOptionsPicker />
        </aside>
        <div className="forme-store-results">
          <Suspense
            fallback={
              <SkeletonProductGrid
                numberOfProducts={collection.products?.length}
              />
            }
          >
            <PaginatedProducts
              sortBy={sortBy || "created_at"}
              page={page ? parseInt(page) : 1}
              collectionId={collection.id}
              countryCode={countryCode}
              optionValueIds={optionValueIds}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
