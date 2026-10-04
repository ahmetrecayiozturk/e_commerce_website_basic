import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  SHIPMENT_TRACKING_MODULE,
} from "../../../../../modules/shipment-tracking"
import ShipmentTrackingModuleService from "../../../../../modules/shipment-tracking/service"

// GET /store/orders/:id/tracking -> müşterinin sipariş takip sayfasında
// kullanacağı kargo bilgisi (carrier, tracking_number, tracking_url,
// güncel durum ve durum geçmişi)
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

  if (!trackings.length) {
    res.json({ trackings: [], message: "Bu sipariş için henüz kargo bilgisi girilmedi." })
    return
  }

  res.json({ trackings })
}
