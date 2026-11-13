"use client"
import { deleteLineItem } from "@lib/data/cart"
import { notifyCartUpdated } from "@lib/util/cart-events"
import { Spinner, Trash } from "@medusajs/icons"
import { useState } from "react"
export default function DeleteButton({
  id,
  children,
  className,
  label = "Remove item from bag",
  ...props
}: {
  id: string
  children?: React.ReactNode
  className?: string
  label?: string
  "data-testid"?: string
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  return (
    <div className={className}>
      <button
        {...props}
        type="button"
        className="forme-delete-button"
        aria-label={label}
        disabled={pending}
        onClick={async () => {
          setPending(true)
          setError("")
          try {
            await deleteLineItem(id)
            notifyCartUpdated()
          } catch {
            setError("Could not remove this item. Please try again.")
            setPending(false)
          }
        }}
      >
        {pending ? (
          <Spinner aria-hidden="true" className="animate-spin" />
        ) : (
          <Trash aria-hidden="true" />
        )}
        <span>{children}</span>
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
