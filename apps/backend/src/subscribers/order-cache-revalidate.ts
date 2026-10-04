import type { SubscriberConfig, SubscriberArgs } from "@medusajs/framework"
import { revalidateStorefrontOrders } from "../utils/revalidate-storefront"

export default async function orderCacheRevalidateHandler({
  event,
}: SubscriberArgs<any>) {
  console.log(`Sipariş olayı yakalandı: ${event.name} — storefront önbelleği temizleniyor`)
  await revalidateStorefrontOrders()
}

export const config: SubscriberConfig = {
  event: [
    "order.placed",
    "order.updated",
    "order.canceled",
    "order.completed",
    "order.fulfillment_created",
    "order.fulfillment_canceled",
    "order.payment_captured",
    "order.return_requested",
    "shipment.created",
    "delivery.created",
  ],
}