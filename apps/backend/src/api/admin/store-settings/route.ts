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
  const integration = await service.getIntegrationConfig(tenantId)

  res.json({
    store_settings: {
      ...settings,
      iyzico_api_key: undefined,
      iyzico_secret_key: undefined,
      smtp_user: undefined,
      smtp_pass: undefined,
      integrations: {
        iyzico: {
          configured: Boolean(integration.iyzicoApiKey && integration.iyzicoSecretKey),
          base_url: integration.iyzicoBaseUrl,
        },
        smtp: {
          configured: Boolean(
            integration.smtpHost &&
              integration.smtpUser &&
              integration.smtpPass &&
              integration.smtpFrom
          ),
          host: integration.smtpHost,
          port: integration.smtpPort,
          from: integration.smtpFrom,
          secure: integration.smtpSecure,
        },
      },
    },
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
