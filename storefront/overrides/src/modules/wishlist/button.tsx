"use client"
import { useWishlist } from "./provider"
export default function WishlistButton({
  id,
  title,
  compact = false,
}: {
  id: string
  title: string
  compact?: boolean
}) {
  const { ids, busy, toggle } = useWishlist()
  const saved = ids.includes(id)
  return (
    <button
      type="button"
      className={compact ? "forme-save forme-save-compact" : "forme-save"}
      disabled={busy}
      aria-pressed={saved}
      aria-label={`${saved ? "Remove" : "Save"} ${title} ${saved ? "from" : "to"} wishlist`}
      onClick={() => void toggle(id)}
    >
      <svg
        aria-hidden="true"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
      </svg>
      {!compact && (
        <span>{saved ? "Saved to wishlist" : "Save for later"}</span>
      )}
    </button>
  )
}
