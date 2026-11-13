import type { HttpTypes } from "@medusajs/types"
export default function OrderDetails({
  order,
}: {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}) {
  return (
    <div className="forme-order-meta">
      <p>
        Order <strong data-testid="order-id">{order.display_id}</strong>
      </p>
      <p>
        Placed{" "}
        <time dateTime={String(order.created_at)} data-testid="order-date">
          {new Date(order.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
      </p>
      <p>
        Order contact: <span data-testid="order-email">{order.email}</span>
      </p>
      <p>Keep this confirmation page for your records.</p>
    </div>
  )
}
