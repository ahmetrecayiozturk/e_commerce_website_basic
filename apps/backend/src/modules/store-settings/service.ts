import { MedusaError, MedusaService, Modules } from "@medusajs/framework/utils"
import StoreSetting from "./models/store-setting"

class StoreSettingsModuleService extends MedusaService({
  StoreSetting,
}) {
  async getStoreSettingsForTenant(tenantId = "default") {
    const settings = await this.listStoreSettings(
      { tenant_id: tenantId },
      { order: { updated_at: "DESC" } }
    )

    if (settings.length > 0) {
      return settings[0]
    }

    return this.createStoreSettings({
      tenant_id: tenantId,
      store_name: "Yeni Mağaza",
      store_slug: "yeni-magaza",
      logo_url: "",
      primary_color: "#111827",
      secondary_color: "#f59e0b",
      contact_email: "",
      contact_phone: "",
      address: "",
      social_links: {},
      return_policy: "",
      shipping_policy: "",
      theme_key: "classic",
      country_code: "TR",
      default_region_id: "",
      default_currency_code: "TRY",
      default_sales_channel_id: "",
      default_shipping_profile_id: "",
      default_shipping_option_id: "",
      default_stock_location_id: "",
      default_payment_provider_id: "",
      shipping_fee: 0,
      free_shipping_limit: 0,
      estimated_delivery_days: 3,
      is_active: true,
      audit_log: [],
    } as any)
  }

  async saveStoreSettings(tenantId: string, payload: Record<string, any>) {
    const existing = await this.getStoreSettingsForTenant(tenantId)
    const currentAudit = Array.isArray(existing.audit_log)
      ? existing.audit_log
      : []

    const { id: _existingId, ...existingSettings } = existing
    const nextSettings = {
      ...existingSettings,
      tenant_id: tenantId,
      ...payload,
      social_links: payload.social_links ?? existing.social_links ?? {},
      audit_log: [
        ...currentAudit,
        {
          modified_at: new Date().toISOString(),
          before: {
            store_name: existing.store_name,
            default_region_id: existing.default_region_id,
            default_currency_code: existing.default_currency_code,
            default_sales_channel_id: existing.default_sales_channel_id,
            default_shipping_profile_id: existing.default_shipping_profile_id,
            default_shipping_option_id: existing.default_shipping_option_id,
            default_stock_location_id: existing.default_stock_location_id,
            default_payment_provider_id: existing.default_payment_provider_id,
            shipping_fee: existing.shipping_fee,
            free_shipping_limit: existing.free_shipping_limit,
            estimated_delivery_days: existing.estimated_delivery_days,
            theme_key: existing.theme_key,
          },
          after: {
            store_name: payload.store_name ?? existing.store_name,
            default_region_id: payload.default_region_id ?? existing.default_region_id,
            default_currency_code:
              payload.default_currency_code ?? existing.default_currency_code,
            default_sales_channel_id:
              payload.default_sales_channel_id ?? existing.default_sales_channel_id,
            default_shipping_profile_id:
              payload.default_shipping_profile_id ?? existing.default_shipping_profile_id,
            default_shipping_option_id:
              payload.default_shipping_option_id ?? existing.default_shipping_option_id,
            default_stock_location_id:
              payload.default_stock_location_id ?? existing.default_stock_location_id,
            default_payment_provider_id:
              payload.default_payment_provider_id ?? existing.default_payment_provider_id,
            shipping_fee: payload.shipping_fee ?? existing.shipping_fee,
            free_shipping_limit:
              payload.free_shipping_limit ?? existing.free_shipping_limit,
            estimated_delivery_days:
              payload.estimated_delivery_days ?? existing.estimated_delivery_days,
            theme_key: payload.theme_key ?? existing.theme_key,
          },
        },
      ].slice(-20),
    }

    return this.updateStoreSettings({
      id: existing.id,
      ...nextSettings,
    } as any)
  }

  async validateStoreSettingsPayload(payload: Record<string, any>, req: any) {
    const regionService = req.scope.resolve(Modules.REGION) as any
    const salesChannelService = req.scope.resolve(Modules.SALES_CHANNEL) as any
    const fulfillmentService = req.scope.resolve(Modules.FULFILLMENT) as any
    const stockLocationService = req.scope.resolve(Modules.STOCK_LOCATION) as any
    const paymentService = req.scope.resolve(Modules.PAYMENT) as any

    const regionIds = (await regionService.listRegions({}, { select: ["id"] })).map(
      (region: any) => region.id
    )
    const salesChannelIds = (
      await salesChannelService.listSalesChannels({}, { select: ["id"] })
    ).map((channel: any) => channel.id)
    const shippingProfileIds = (
      await fulfillmentService.listShippingProfiles({}, { select: ["id"] })
    ).map((profile: any) => profile.id)
    const shippingOptionIds = (
      await fulfillmentService.listShippingOptions({}, { select: ["id"] })
    ).map((option: any) => option.id)
    const stockLocationIds = (
      await stockLocationService.listStockLocations({}, { select: ["id"] })
    ).map((location: any) => location.id)
    const paymentProviderIds = (
      await paymentService.listPaymentProviders({}, { select: ["id"] })
    ).map((provider: any) => provider.id)

    const validations = [
      {
        key: "default_region_id",
        value: payload.default_region_id,
        validIds: regionIds,
        label: "Bölge",
      },
      {
        key: "default_sales_channel_id",
        value: payload.default_sales_channel_id,
        validIds: salesChannelIds,
        label: "Satış kanalı",
      },
      {
        key: "default_shipping_profile_id",
        value: payload.default_shipping_profile_id,
        validIds: shippingProfileIds,
        label: "Kargo profili",
      },
      {
        key: "default_shipping_option_id",
        value: payload.default_shipping_option_id,
        validIds: shippingOptionIds,
        label: "Kargo yöntemi",
      },
      {
        key: "default_stock_location_id",
        value: payload.default_stock_location_id,
        validIds: stockLocationIds,
        label: "Depo konumu",
      },
      {
        key: "default_payment_provider_id",
        value: payload.default_payment_provider_id,
        validIds: paymentProviderIds,
        label: "Ödeme sağlayıcısı",
      },
    ]

    for (const rule of validations) {
      if (!rule.value) {
        continue
      }

      if (!rule.validIds.includes(rule.value)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `${rule.label} için seçilen kayıt mevcut değil. Lütfen listeden tekrar seçin.`
        )
      }
    }

    if (payload.default_currency_code) {
      const regionCurrency = (await regionService.listRegions({}, { select: ["id", "currency_code"] }))
      const hasMatchingCurrency = regionCurrency.some(
        (region: any) => region.currency_code === payload.default_currency_code
      )

      if (!hasMatchingCurrency) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Seçilen para birimi sistemde tanımlı bölge para birimiyle uyuşmuyor."
        )
      }
    }

    if (
      payload.default_region_id &&
      payload.default_shipping_option_id &&
      payload.default_shipping_profile_id
    ) {
      const profiles = await fulfillmentService.listShippingProfiles({}, { select: ["id", "name"] })
      const options = await fulfillmentService.listShippingOptions({}, { select: ["id", "name", "shipping_profile_id"] })
      const selectedProfile = profiles.find(
        (profile: any) => profile.id === payload.default_shipping_profile_id
      )
      const selectedOption = options.find(
        (option: any) => option.id === payload.default_shipping_option_id
      )

      if (selectedProfile && selectedOption && selectedOption.shipping_profile_id !== selectedProfile.id) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Seçilen kargo yöntemi ile kargo profili birbirine uygun değil."
        )
      }
    }

    return true
  }
}

export default StoreSettingsModuleService
