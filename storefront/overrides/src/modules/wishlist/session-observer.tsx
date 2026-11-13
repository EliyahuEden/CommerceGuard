"use client"
import { useEffect } from "react"
export default function WishlistSessionObserver({
  customerId,
}: {
  customerId: string | null
}) {
  useEffect(() => {
    window.dispatchEvent(new Event("forme-auth-changed"))
  }, [customerId])
  return null
}
