import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  SHIPMENT_TRACKING_MODULE,
} from "../../../../../modules/shipment-tracking"
import ShipmentTrackingModuleService from "../../../../../modules/shipment-tracking/service"
import { revalidateStorefrontOrders } from "../../../../../utils/revalidate-storefront"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const service: ShipmentTrackingModuleService = req.scope.resolve(
    SHIPMENT_TRACKING_MODULE
  )
  const orderId = req.params.id

  const trackings = await service.listShipmentTrackings(
    { order_id: orderId },
    { order: { created_at: "DESC" } }
  )

  res.json({ trackings })
}

type CreateTrackingBody = {
  fulfillment_id?: string
  carrier: string
  carrier_name?: string
  tracking_number: string
}

export async function POST(
  req: MedusaRequest<CreateTrackingBody>,
  res: MedusaResponse
): Promise<void> {
  const service: ShipmentTrackingModuleService = req.scope.resolve(
    SHIPMENT_TRACKING_MODULE
  )
  const orderId = req.params.id
  const { fulfillment_id, carrier, carrier_name, tracking_number } = req.body

  if (!carrier || !tracking_number) {
    res
      .status(400)
      .json({ message: "carrier ve tracking_number zorunludur." })
    return
  }

  const tracking_url = await service.buildTrackingUrl(carrier, tracking_number)

  const tracking = await service.createShipmentTrackings({
    order_id: orderId,
    fulfillment_id,
    carrier: carrier as any,
    carrier_name,
    tracking_number,
    tracking_url,
    status: "shipped",
    status_history: [
      {
        status: "shipped",
        note: "Kargoya verildi",
        created_at: new Date().toISOString(),
      },
    ] as any,
  } as any)
  await revalidateStorefrontOrders()
    
  res.status(201).json({ tracking })
}