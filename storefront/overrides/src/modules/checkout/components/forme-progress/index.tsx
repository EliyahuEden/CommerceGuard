"use client"
import { useSearchParams } from "next/navigation"
export default function CheckoutProgress() {
  const current = ["address", "delivery", "payment", "review"].indexOf(
    useSearchParams().get("step") || "address",
  )
  return (
    <nav aria-label="Checkout progress">
      <ol className="forme-checkout-progress">
        {["Address", "Delivery", "Payment", "Review"].map((label, index) => (
          <li
            key={label}
            aria-current={index === current ? "step" : undefined}
            className={index <= current ? "is-reached" : ""}
          >
            <span aria-hidden="true">{index < current ? "✓" : index + 1}</span>
            {label}
            {index === current && (
              <span className="sr-only"> — current step</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
