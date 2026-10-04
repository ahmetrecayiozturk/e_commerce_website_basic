import { model } from "@medusajs/framework/utils"

const ReturnRequest = model.define("return_request", {
  id: model.id().primaryKey(),
  order_id: model.text().index("IDX_return_request_order_id"),
  order_display_id: model.number().nullable(),
  type: model.enum(["return", "cancellation"]).default("return"),
  customer_email: model.text(),
  customer_name: model.text(),
  item_description: model.text(),
  reason: model.text(),
  status: model.enum(["pending", "approved", "rejected", "refunded"]).default("pending"),
  admin_note: model.text().nullable(),
  // İade kargosu bilgileri — admin, kargo firmasının kendi
  // portalından elle oluşturduğu kodu buraya girer.
  return_carrier: model.enum(["yurtici", "aras", "mng", "ptt", "surat", "ups", "other"]).nullable(),
  return_code: model.text().nullable(),
  return_instructions: model.text().nullable(),
})

export default ReturnRequest
