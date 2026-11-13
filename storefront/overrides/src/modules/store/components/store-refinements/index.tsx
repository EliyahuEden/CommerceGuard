"use client"
import { useEffect, useState } from "react"
import { useSortBy } from "react-instantsearch"
import FilterRadioGroup from "@modules/common/components/filter-radio-group"
import {
  CATEGORY_ATTRIBUTE,
  LABELS_ATTRIBUTE,
  getSortOptions,
} from "./attributes"
import CurrentRefinements from "./current-refinements"
import OnSaleToggle from "./on-sale-toggle"
import OptionRefinements from "./option-refinements"
import PriceRange from "./price-range"
import RefinementGroup from "./refinement-group"
function SortProducts({ currencyCode }: { currencyCode: string }) {
  const items = getSortOptions(currencyCode)
  const { currentRefinement, refine } = useSortBy({ items })
  return (
    <FilterRadioGroup
      title="Sort by"
      items={items}
      value={currentRefinement}
      handleChange={refine}
      data-testid="sort-by-container"
    />
  )
}
export default function StoreRefinements({
  currencyCode,
}: {
  currencyCode: string
}) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)")
    const update = () => setOpen(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  return (
    <aside className="forme-filters" aria-label="Product filters">
      <button
        type="button"
        className="forme-filter-toggle"
        aria-expanded={open}
        aria-controls="collection-filters"
        onClick={() => setOpen((value) => !value)}
        data-testid="filters-toggle"
      >
        Filter & sort <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <div id="collection-filters" className="forme-filter-body" hidden={!open}>
        <h2 className="forme-filter-label">Refine your edit</h2>
        <CurrentRefinements currencyCode={currencyCode} />
        <RefinementGroup attribute={CATEGORY_ATTRIBUTE} title="Category" />
        <OptionRefinements />
        <SortProducts currencyCode={currencyCode} />
        <PriceRange currencyCode={currencyCode} />
        <OnSaleToggle currencyCode={currencyCode} />
        <RefinementGroup attribute={LABELS_ATTRIBUTE} title="Labels" />
      </div>
    </aside>
  )
}
