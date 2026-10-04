import type { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { Modules } from "@medusajs/framework/utils"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const notificationService = container.resolve(Modules.NOTIFICATION)
  const orderService = container.resolve(Modules.ORDER)

  // 1. Verilen siparişin detaylarını çekiyoruz
  const order = await orderService.retrieveOrder(data.id)

  if (!order.email) return

  console.log(`[SendGrid] ${order.email} adresine sipariş onayı gönderiliyor...`)

  // 2. SendGrid motorunu tetikliyoruz
  await notificationService.createNotifications({
    to: order.email,
    channel: "email",
    template: process.env.SENDGRID_ORDER_PLACED_TPL as string,
    data: {
      // Bu bilgileri SendGrid şablonunda {{ order_id }} olarak kullanabilirsin
      order_id: order.display_id || order.id, 
      total: order.total
    },
  })
}

export const config: SubscriberConfig = {
  event: "order.placed", // Sadece sipariş oluşturulduğunda tetiklenir
}