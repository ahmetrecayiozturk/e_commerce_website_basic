import { model } from "@medusajs/framework/utils"

const Review = model.define("review", {
  id: model.id().primaryKey(),
  product_id: model.text().index("IDX_review_product_id"),
  customer_id: model.text().nullable(),
  customer_name: model.text(),
  rating: model.number(), // 1-5
  title: model.text().nullable(),
  content: model.text(),
  status: model.enum(["pending", "approved", "rejected"]).default("pending"),
  order_id: model.text().nullable(), // satın alma doğrulaması için (opsiyonel)
})

export default Review
