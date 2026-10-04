import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import createStoreProductWorkflow from "../../../workflows/create-store-product"

const resolveTenantId = (req: MedusaRequest) => {
  const authTenantId = (req as any).auth_context?.tenant_id ?? (req as any).auth?.tenant_id
  const userTenantId = (req as any).user?.tenant_id
  return authTenantId ?? userTenantId ?? "default"
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productService = req.scope.resolve(Modules.PRODUCT) as any

  const [products, count] = await productService.listAndCount(
    {},
    {
      take: 20,
      order: { created_at: "DESC" },
    }
  )

  res.json({
    products,
    count,
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const payload = (req.body ?? {}) as Record<string, any>
    const { result } = await createStoreProductWorkflow(req.scope).run({
      input: {
        ...payload,
        options: payload.options ?? [],
        variants: payload.variants ?? [],
        tenant_id: resolveTenantId(req),
      },
    })

    res.status(201).json({
      product: result.product,
      products: result.products,
      message: "Ürün oluşturuldu.",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ürün oluşturulamadı."

    res.status(400).json({
      message,
    })
  }
}
