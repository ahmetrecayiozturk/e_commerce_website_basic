import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/core-flows"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productService = req.scope.resolve(Modules.PRODUCT) as any

  const product = await productService.retrieveProduct(req.params.id)

  res.json({
    product,
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  const productService = req.scope.resolve(Modules.PRODUCT) as any
  const existing = await productService.retrieveProduct(id).catch(() => null)

  if (!existing) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Product with id "${id}" not found`
    )
  }

  const payload = (req.body ?? {}) as Record<string, any>
  const {
    area: _area,
    tenant_id: _tenantId,
    category,
    price: _price,
    stock_quantity: _stockQuantity,
    ...update
  } = payload
  const updatePayload = {
    ...update,
    title: update.title ?? existing.title,
    handle: update.handle ?? existing.handle,
    description: update.description ?? existing.description,
    status: update.status ?? existing.status,
    discountable: update.discountable ?? existing.discountable,
    metadata: {
      ...(existing.metadata ?? {}),
      ...(category !== undefined ? { category_name: category } : {}),
      ...(_stockQuantity !== undefined ? { stock_quantity: Number(_stockQuantity) } : {}),
    },
  }

  const { result } = await updateProductsWorkflow(req.scope).run({
    input: {
      selector: { id },
      update: updatePayload,
    },
  })

  const product = await productService.retrieveProduct(result[0].id)

  res.json({
    product,
    message: "Ürün güncellendi.",
  })
}
