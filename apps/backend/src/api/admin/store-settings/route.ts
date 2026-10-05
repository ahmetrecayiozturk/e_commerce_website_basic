import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { STORE_SETTINGS_MODULE } from "../../../modules/store-settings"
import StoreSettingsModuleService from "../../../modules/store-settings/service"

const resolveTenantId = (req: MedusaRequest) => {
  const authTenantId = (req as any).auth_context?.tenant_id ?? (req as any).auth?.tenant_id
  const userTenantId = (req as any).user?.tenant_id
  return authTenantId ?? userTenantId ?? "default"
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: StoreSettingsModuleService = req.scope.resolve(STORE_SETTINGS_MODULE)
  const tenantId = resolveTenantId(req)
  const settings = await service.getStoreSettingsForTenant(tenantId)

  res.json({
    store_settings: settings,
    platform_defaults: {
      country_code: "TR",
      currency_code: "TRY",
      payment_provider: "iyzico",
    },
  })
}

export async function POST(req: MedusaRequest<Record<string, any>>, res: MedusaResponse) {
  const service: StoreSettingsModuleService = req.scope.resolve(STORE_SETTINGS_MODULE)
  const tenantId = resolveTenantId(req)

  try {
    await service.validateStoreSettingsPayload(req.body, req)
    const updated = await service.saveStoreSettings(tenantId, req.body)

    res.json({
      store_settings: updated,
      message: "Mağaza ayarları kaydedildi.",
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Mağaza ayarları kaydedilemedi."

    res.status(400).json({
      message,
    })
  }
}
