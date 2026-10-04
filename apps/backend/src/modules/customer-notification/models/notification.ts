import { model } from "@medusajs/framework/utils"

export const CustomerNotification = model.define("customer_notification", {
  id: model.id().primaryKey(),
  customer_id: model.text().searchable(),
  subject: model.text(),
  message: model.text(),
  is_read: model.boolean().default(false)
})