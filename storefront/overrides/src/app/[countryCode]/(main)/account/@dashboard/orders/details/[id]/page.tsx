import { retrieveCustomer } from "@lib/data/customer"
import { retrieveOrder } from "@lib/data/orders"
import OrderDetailsTemplate from "@modules/order/templates/order-details-template"
import { notFound } from "next/navigation"
import { cache } from "react"

const ownedOrder = cache(async (id: string) => {
  const customer = await retrieveCustomer()
  if (!customer) notFound()
  const order = await retrieveOrder(id).catch(() => null)
  if (!order || order.customer_id !== customer.id) notFound()
  return order
})
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const order = await ownedOrder((await params).id)
  return { title: `Order #${order.display_id}`, description: "View your order" }
}
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <OrderDetailsTemplate order={await ownedOrder((await params).id)} />
}
