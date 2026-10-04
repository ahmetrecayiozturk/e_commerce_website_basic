import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  SHIPMENT_TRACKING_MODULE,
} from "../../../../../../modules/shipment-tracking"
import ShipmentTrackingModuleService from "../../../../../../modules/shipment-tracking/service"
import { revalidateStorefrontOrders } from "../../../../../../utils/revalidate-storefront"

type UpdateStatusBody = {
  status:
    | "preparing"
    | "shipped"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "failed"
  note?: string
}

// POST /admin/orders/:id/tracking/:trackingId -> durum günceller,
// geçmişe yeni bir kayıt ekler (örn. "Dağıtıma çıktı")
export async function POST(
  req: MedusaRequest<UpdateStatusBody>,
  res: MedusaResponse
): Promise<void> {
  const service: ShipmentTrackingModuleService = req.scope.resolve(
    SHIPMENT_TRACKING_MODULE
  )
  const { trackingId } = req.params
  const { status, note } = req.body

  const tracking = await service.addStatusUpdate(trackingId, status, note)

  await revalidateStorefrontOrders()

  res.json({ tracking })
}
