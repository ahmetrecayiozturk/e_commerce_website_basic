import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { RETURN_REQUEST_MODULE } from "../../../../../modules/return-requests"
import ReturnRequestModuleService from "../../../../../modules/return-requests/service"
import { revalidateStorefrontOrders } from "../../../../../utils/revalidate-storefront"

type SetShippingCodeBody = {
  return_carrier: string
  return_code: string
  return_instructions?: string
}

// POST /admin/return-requests/:id/shipping-code
// -> admin, kargo firmasının portalından aldığı iade kodunu girer
export async function POST(
  req: MedusaRequest<SetShippingCodeBody>,
  res: MedusaResponse
): Promise<void> {
  const service: ReturnRequestModuleService = req.scope.resolve(
    RETURN_REQUEST_MODULE
  )
  const { id } = req.params
  const { return_carrier, return_code, return_instructions } = req.body

  if (!return_carrier || !return_code) {
    res.status(400).json({
      message: "return_carrier ve return_code zorunludur.",
    })
    return
  }

  const request = await service.updateReturnRequests({
    id,
    return_carrier: return_carrier as any,
    return_code,
    return_instructions,
  } as any)

  await revalidateStorefrontOrders()

  res.json({ return_request: request })
}
