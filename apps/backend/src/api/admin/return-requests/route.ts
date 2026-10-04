import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { RETURN_REQUEST_MODULE } from "../../../modules/return-requests"
import ReturnRequestModuleService from "../../../modules/return-requests/service"

// GET /admin/return-requests?status=pending -> admin moderasyon listesi
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const service: ReturnRequestModuleService = req.scope.resolve(
    RETURN_REQUEST_MODULE
  )
  const status = req.query.status as string | undefined

  const filters = status ? { status } : {}

  const requests = await service.listReturnRequests(filters, {
    order: { created_at: "DESC" },
  })

  res.json({ return_requests: requests, count: requests.length })
}
