import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { RETURN_REQUEST_MODULE } from "../../../../../modules/return-requests"
import ReturnRequestModuleService from "../../../../../modules/return-requests/service"

// GET /store/orders/:id/cancellation-requests -> müşterinin iptal talebi durumu
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const service: ReturnRequestModuleService = req.scope.resolve(
    RETURN_REQUEST_MODULE
  )
  const orderId = req.params.id

  const requests = await service.listReturnRequests(
    { order_id: orderId, type: "cancellation" } as any,
    { order: { created_at: "DESC" } }
  )

  res.json({ cancellation_requests: requests })
}

type CreateCancellationBody = {
  order_display_id?: number
  customer_email: string
  customer_name: string
  item_description: string
  reason: string
}

// POST /store/orders/:id/cancellation-requests -> yeni iptal talebi
// (yalnızca henüz kargoya verilmemiş/fulfill edilmemiş siparişler için)
export async function POST(
  req: MedusaRequest<CreateCancellationBody>,
  res: MedusaResponse
): Promise<void> {
  const service: ReturnRequestModuleService = req.scope.resolve(
    RETURN_REQUEST_MODULE
  )
  const orderId = req.params.id

  const orderModuleService: any = req.scope.resolve(Modules.ORDER)
  const order = await orderModuleService.retrieveOrder(orderId)

  const items = (order as any).items ?? []
  const hasAnyFulfillment = items.some((item: any) => {
    const detail = item.detail ?? {}
    const fulfilledQuantity = Number(detail.fulfilled_quantity ?? 0)
    return fulfilledQuantity > 0
  })

  if (hasAnyFulfillment) {
    res.status(400).json({
      message:
        "Bu sipariş kargoya verilmiş, artık iptal talebi oluşturulamaz. İade talebi oluşturabilirsiniz.",
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
    type: "cancellation",
    customer_email,
    customer_name,
    item_description,
    reason,
    status: "pending",
  } as any)

  res.status(201).json({ cancellation_request: request })
}