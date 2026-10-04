import { model } from "@medusajs/framework/utils"

const ShipmentTracking = model.define("shipment_tracking", {
  id: model.id().primaryKey(),
  order_id: model.text().index("IDX_shipment_tracking_order_id"),
  fulfillment_id: model.text().nullable(),
  carrier: model.enum([
    "yurtici",
    "aras",
    "mng",
    "ptt",
    "surat",
    "ups",
    "other",
  ]),
  carrier_name: model.text().nullable(), // carrier = "other" ise serbest metin
  tracking_number: model.text(),
  tracking_url: model.text().nullable(),
  status: model
    .enum([
      "preparing",
      "shipped",
      "in_transit",
      "out_for_delivery",
      "delivered",
      "failed",
    ])
    .default("preparing"),
  status_history: model.json().default([] as any),
})

export default ShipmentTracking
