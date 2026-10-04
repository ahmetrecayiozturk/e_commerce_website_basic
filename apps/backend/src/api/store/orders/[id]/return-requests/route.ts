import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { RETURN_REQUEST_MODULE } from "../../../../../modules/return-requests"
import ReturnRequestModuleService from "../../../../../modules/return-requests/service"
import { Modules } from "@medusajs/framework/utils"
// GET /store/orders/:id/return-requests -> müşteri kendi iade taleplerinin durumunu görür
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const service: ReturnRequestModuleService = req.scope.resolve(
    RETURN_REQUEST_MODULE
  )
  const orderId = req.params.id

  const requests = await service.listReturnRequests(
    { order_id: orderId, type: "return" } as any,
    { order: { created_at: "DESC" } }
  )

  res.json({ return_requests: requests })
}

type CreateReturnRequestBody = {
  order_display_id?: number
  customer_email: string
  customer_name: string
  item_description: string
  reason: string
}

// POST /store/orders/:id/return-requests -> yeni iade talebi oluşturur (pending)
export async function POST(
  req: MedusaRequest<CreateReturnRequestBody>,
  res: MedusaResponse
): Promise<void> {
  const service: ReturnRequestModuleService = req.scope.resolve(
    RETURN_REQUEST_MODULE
  )
  const orderId = req.params.id

  const orderModuleService: any = req.scope.resolve(Modules.ORDER)
  const order = await orderModuleService.retrieveOrder(orderId)

  const items = (order as any).items ?? []
  const isFullyDelivered =
    items.length > 0 &&
    items.every((item: any) => {
      const detail = item.detail ?? {}
      const quantity = Number(detail.quantity ?? 0)
      const deliveredQuantity = Number(detail.delivered_quantity ?? 0)
      return deliveredQuantity >= quantity
    })

  if (!isFullyDelivered) {
    res.status(400).json({
      message:
        "İade talebi yalnızca teslim edilmiş siparişler için oluşturulabilir.",
    })
    return
  }

  const {
    order_display_id,
    customer_email,
    customer_name,
    item_description,
    reason,
  } = req.body

  if (!customer_email || !customer_name || !item_description || !reason) {
    res.status(400).json({
      message:
        "customer_email, customer_name, item_description ve reason zorunludur.",
    })
    return
  }

  const request = await service.createReturnRequests({
    order_id: orderId,
    order_display_id,
    customer_email,
    customer_name,
    item_description,
    reason,
    status: "pending",
  })

  res.status(201).json({ return_request: request })
}
