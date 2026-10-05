import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { STORE_SETTINGS_MODULE } from "../../../modules/store-settings"
import StoreSettingsModuleService from "../../../modules/store-settings/service"

const resolveTenantId = (req: MedusaRequest) => {
  const authTenantId = (req as any).auth_context?.tenant_id ?? (req as any).auth?.tenant_id
  const userTenantId = (req as any).user?.tenant_id
  return authTenantId ?? userTenantId ?? "default"
}

const getVisibleName = (item: any) => {
  if (!item) {
    return ""
  }

  return item.name || item.label || item.id || ""
}

const normalizeOptionList = (items: any[] = []) =>
  items.map((item) => ({
    id: item.id,
    name: getVisibleName(item),
  }))

const safeList = async (list: () => Promise<any[]>) => {
  try {
    return await list()
  } catch {
    return []
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: StoreSettingsModuleService = req.scope.resolve(STORE_SETTINGS_MODULE)
  const tenantId = resolveTenantId(req)
  const settings = await service.getStoreSettingsForTenant(tenantId)

  const regionService = req.scope.resolve(Modules.REGION) as any
  const salesChannelService = req.scope.resolve(Modules.SALES_CHANNEL) as any
  const fulfillmentService = req.scope.resolve(Modules.FULFILLMENT) as any
  const stockLocationService = req.scope.resolve(Modules.STOCK_LOCATION) as any
  const paymentService = req.scope.resolve(Modules.PAYMENT) as any

  const [regions, salesChannels, shippingProfiles, shippingOptions, stockLocations, paymentProviders] =
    await Promise.all([
      safeList(() => regionService.listRegions({}, { select: ["id", "name", "currency_code"] })),
      safeList(() => salesChannelService.listSalesChannels({}, { select: ["id", "name"] })),
      safeList(() => fulfillmentService.listShippingProfiles({}, { select: ["id", "name"] })),
      safeList(() =>
        fulfillmentService.listShippingOptions({}, { select: ["id", "name", "shipping_profile_id"] })
      ),
      safeList(() => stockLocationService.listStockLocations({}, { select: ["id", "name"] })),
      safeList(() => paymentService.listPaymentProviders({}, { select: ["id", "is_enabled"] })),
    ])

  res.json({
    store_settings: settings,
    available_options: {
      regions: normalizeOptionList(regions),
      sales_channels: normalizeOptionList(salesChannels),
      shipping_profiles: normalizeOptionList(shippingProfiles),
      shipping_options: normalizeOptionList(shippingOptions),
      stock_locations: normalizeOptionList(stockLocations),
      payment_providers: normalizeOptionList(paymentProviders),
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
