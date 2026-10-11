import { model } from "@medusajs/framework/utils"

const StoreSetting = model.define("store_setting", {
  id: model.id().primaryKey(),
  tenant_id: model.text().index("IDX_store_setting_tenant_id").unique(),
  store_name: model.text().default("Yeni Mağaza"),
  store_slug: model.text().nullable(),
  logo_url: model.text().nullable(),
  primary_color: model.text().nullable(),
  secondary_color: model.text().nullable(),
  contact_email: model.text().nullable(),
  contact_phone: model.text().nullable(),
  address: model.text().nullable(),
  social_links: model.json().default({}),
  return_policy: model.text().nullable(),
  shipping_policy: model.text().nullable(),
  theme_key: model.enum(["classic", "minimal", "modern", "fashion"]).default("classic"),
  country_code: model.text().nullable(),
  default_region_id: model.text().nullable(),
  default_currency_code: model.text().nullable(),
  default_sales_channel_id: model.text().nullable(),
  default_shipping_profile_id: model.text().nullable(),
  default_shipping_option_id: model.text().nullable(),
  default_stock_location_id: model.text().nullable(),
  default_payment_provider_id: model.text().nullable(),
  shipping_fee: model.number().default(0),
  free_shipping_limit: model.number().default(0),
  estimated_delivery_days: model.number().default(3),
  is_active: model.boolean().default(true),
  audit_log: model.json().default([] as any),
})

export default StoreSetting
