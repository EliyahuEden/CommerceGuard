"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { usePathname } from "next/navigation"
import { saveWishlist } from "@lib/data/wishlist"

const key = "forme.guest-wishlist.v1"
function guestIds(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || "[]")
    return Array.isArray(value)
      ? Array.from(
          new Set(
            value.filter(
              (id): id is string =>
                typeof id === "string" && /^prod_[a-zA-Z0-9]+$/.test(id),
            ),
          ),
        ).slice(0, 100)
      : []
  } catch {
    return []
  }
}
type WishlistState = {
  ids: string[]
  customerId: string | null
  busy: boolean
  toggle: (id: string) => Promise<void>
}
const WishlistContext = createContext<WishlistState | null>(null)
export function useWishlist() {
  const value = useContext(WishlistContext)
  if (!value) throw new Error("Wishlist controls require WishlistProvider")
  return value
}

export default function WishlistProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [productIds, setIds] = useState<string[]>([])
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [writing, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [sessionVersion, setSessionVersion] = useState(0)
  const requestKey = `${pathname}:${sessionVersion}`
  const [syncedKey, setSyncedKey] = useState<string | null>(null)
  const busy = writing || syncedKey !== requestKey
  useEffect(() => {
    const changed = () => setSessionVersion((value) => value + 1)
    window.addEventListener("forme-auth-changed", changed)
    return () => window.removeEventListener("forme-auth-changed", changed)
  }, [])
  useEffect(() => {
    let active = true
    const controller = new AbortController()
    async function sync() {
      try {
        const response = await fetch("/api/wishlist", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        })
        if (!response.ok) throw new Error("Wishlist session unavailable")
        const session: { customerId: string | null; ids: string[] } =
          await response.json()
        const guest = guestIds()
        const merged = Array.from(new Set([...session.ids, ...guest])).slice(
          0,
          100,
        )
        if (session.customerId && guest.length) await saveWishlist(merged)
        if (!active) return
        if (session.customerId && guest.length) {
          const remaining = guest.filter((id) => !merged.includes(id))
          if (remaining.length)
            localStorage.setItem(key, JSON.stringify(remaining))
          else localStorage.removeItem(key)
        }
        setCustomerId(session.customerId)
        setIds(session.customerId ? merged : guest)
        setMessage(
          session.customerId && guest.length
            ? "Your saved products are now in your account wishlist."
            : "",
        )
      } catch {
        if (active)
          setMessage(
            "Wishlist could not sync. Your saved products have been kept. Please try again.",
          )
      } finally {
        if (active) {
          setSyncedKey(requestKey)
          setBusy(false)
        }
      }
    }
    void sync()
    return () => {
      active = false
      controller.abort()
    }
  }, [requestKey])
  const toggle = useCallback(
    async (id: string) => {
      if (busy) return
      const selected = productIds.includes(id)
      const next = selected
        ? productIds.filter((value) => value !== id)
        : [...productIds, id]
      if (next.length > 100) {
        setMessage("Your wishlist can hold up to 100 products.")
        return
      }
      setBusy(true)
      try {
        if (customerId) await saveWishlist(next)
        else localStorage.setItem(key, JSON.stringify(next))
        setIds(next)
        setMessage(
          selected
            ? "Product removed from your wishlist."
            : "Product saved to your wishlist.",
        )
      } catch {
        setMessage("We could not update your wishlist. Please try again.")
      } finally {
        setBusy(false)
      }
    },
    [busy, productIds, customerId],
  )
  return (
    <WishlistContext.Provider
      value={{ ids: productIds, customerId, busy, toggle }}
    >
      {children}
      {message && (
        <div
          className="forme-wishlist-notice"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {message}
          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Dismiss wishlist message"
          >
            ✕
          </button>
        </div>
      )}
    </WishlistContext.Provider>
  )
}
