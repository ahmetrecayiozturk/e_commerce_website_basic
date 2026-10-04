import { model } from "@medusajs/framework/utils"

const SupportTicket = model.define("support_ticket", {
  id: model.id().primaryKey(),
  order_id: model.text().nullable(),
  order_display_id: model.number().nullable(),
  customer_email: model.text().index("IDX_support_ticket_customer_email"),
  customer_name: model.text(),
  subject: model.text(),
  status: model.enum(["open", "closed"]).default("open"),
  // [{ sender: "customer" | "admin", message: string, created_at: string }]
  messages: model.json().default([] as any),
})

export default SupportTicket
