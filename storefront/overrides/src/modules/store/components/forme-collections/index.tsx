import { formeCollections } from "@lib/forme-collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
export default function CollectionLinks({ current }: { current?: string }) {
  return (
    <nav aria-label="Browse collections" className="forme-collection-links">
      {formeCollections.map((collection) => (
        <LocalizedClientLink
          key={collection.handle}
          href={`/collections/${collection.handle}`}
          aria-current={current === collection.handle ? "page" : undefined}
        >
          {collection.title}
        </LocalizedClientLink>
      ))}
    </nav>
  )
}
