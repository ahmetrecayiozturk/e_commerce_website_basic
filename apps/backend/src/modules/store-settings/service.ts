import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import StoreSetting from "./models/store-setting"
import { decryptSecret, encryptSecret } from "./crypto"

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
      iyzico_api_key: null,
      iyzico_secret_key: null,
      iyzico_base_url: "https://api.iyzipay.com",
      smtp_host: null,
      smtp_port: 587,
      smtp_user: null,
      smtp_pass: null,
      smtp_from: null,
      smtp_secure: false,
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
    const integrationPayload = {
      iyzico_api_key: payload.iyzico_api_key
        ? encryptSecret(payload.iyzico_api_key)
        : existing.iyzico_api_key,
      iyzico_secret_key: payload.iyzico_secret_key
        ? encryptSecret(payload.iyzico_secret_key)
        : existing.iyzico_secret_key,
      iyzico_base_url: payload.iyzico_base_url ?? existing.iyzico_base_url,
      smtp_host: payload.smtp_host ?? existing.smtp_host,
      smtp_port: payload.smtp_port ?? existing.smtp_port,
      smtp_user: payload.smtp_user
        ? encryptSecret(payload.smtp_user)
        : existing.smtp_user,
      smtp_pass: payload.smtp_pass
        ? encryptSecret(payload.smtp_pass)
        : existing.smtp_pass,
      smtp_from: payload.smtp_from ?? existing.smtp_from,
      smtp_secure: payload.smtp_secure ?? existing.smtp_secure,
    }
    const nextSettings = {
      ...existingSettings,
      tenant_id: tenantId,
      ...payload,
      ...integrationPayload,
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

  async getIntegrationConfig(tenantId = "default") {
    const settings = await this.getStoreSettingsForTenant(tenantId)
    return {
      iyzicoApiKey: decryptSecret(settings.iyzico_api_key) || process.env.IYZICO_API_KEY || "",
      iyzicoSecretKey:
        decryptSecret(settings.iyzico_secret_key) || process.env.IYZICO_SECRET_KEY || "",
      iyzicoBaseUrl:
        settings.iyzico_base_url || process.env.IYZICO_BASE_URL || "https://api.iyzipay.com",
      smtpHost: settings.smtp_host || process.env.SMTP_HOST || "",
      smtpPort: settings.smtp_port || Number(process.env.SMTP_PORT || 587),
      smtpUser: decryptSecret(settings.smtp_user) || process.env.SMTP_USER || "",
      smtpPass: decryptSecret(settings.smtp_pass) || process.env.SMTP_PASS || "",
      smtpFrom: settings.smtp_from || process.env.SMTP_FROM || "",
      smtpSecure: settings.smtp_secure ?? process.env.SMTP_SECURE === "true",
    }
  }

  async validateStoreSettingsPayload(payload: Record<string, any>, req: any) {
    if (payload.country_code && payload.country_code !== "TR") {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Bu mağaza Türkiye satışları için yapılandırılmıştır.")
    }
    if (payload.default_currency_code && payload.default_currency_code !== "TRY") {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Para birimi TRY olarak sabittir.")
    }
    return true
  }
}

export default StoreSettingsModuleService
