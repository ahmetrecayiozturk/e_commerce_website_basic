import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Button,
  Container,
  Heading,
  Input,
  Select,
  Text,
  Textarea,
} from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"

type StoreSettings = {
  id?: string
  tenant_id?: string
  store_name?: string
  store_slug?: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  contact_email?: string
  contact_phone?: string
  address?: string
  social_links?: Record<string, string>
  return_policy?: string
  shipping_policy?: string
  theme_key?: "classic" | "minimal" | "modern" | "fashion"
  country_code?: string
  default_region_id?: string
  default_currency_code?: string
  default_sales_channel_id?: string
  default_shipping_profile_id?: string
  default_shipping_option_id?: string
  default_stock_location_id?: string
  default_payment_provider_id?: string
  shipping_fee?: number
  free_shipping_limit?: number
  estimated_delivery_days?: number
  is_active?: boolean
}

type OptionList = {
  id: string
  name: string
}[]

const emptySettings: StoreSettings = {
  store_name: "",
  store_slug: "",
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
}

const themeOptions = [
  { value: "classic", label: "Classic" },
  { value: "minimal", label: "Minimal" },
  { value: "modern", label: "Modern" },
  { value: "fashion", label: "Fashion" },
]

const StoreSettingsPage = () => {
  const [settings, setSettings] = useState<StoreSettings>(emptySettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [options, setOptions] = useState({
    regions: [] as OptionList,
    sales_channels: [] as OptionList,
    shipping_profiles: [] as OptionList,
    shipping_options: [] as OptionList,
    stock_locations: [] as OptionList,
    payment_providers: [] as OptionList,
  })

  const loadSettings = async () => {
    setLoading(true)
    const response = await fetch("/admin/store-settings", {
      credentials: "include",
    })
    const data = await response.json()
    setSettings({
      ...emptySettings,
      ...data.store_settings,
      social_links: data.store_settings?.social_links ?? {},
    })
    setOptions(data.available_options ?? options)
    setLoading(false)
  }

  useEffect(() => {
    void loadSettings()
  }, [])

  const optionMap = useMemo(
    () => ({
      regions: options.regions,
      sales_channels: options.sales_channels,
      shipping_profiles: options.shipping_profiles,
      shipping_options: options.shipping_options,
      stock_locations: options.stock_locations,
      payment_providers: options.payment_providers,
    }),
    [options]
  )

  const updateField = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setSettings({
      ...settings,
      [key]: value,
    })
  }

  const saveSettings = async () => {
    setSaving(true)
    const response = await fetch("/admin/store-settings", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })
    const data = await response.json()
    setSaving(false)

    if (!response.ok) {
      alert(data.message || "Mağaza ayarları kaydedilemedi.")
      return
    }

    alert(data.message || "Mağaza ayarları kaydedildi.")
    await loadSettings()
  }

  if (loading) {
    return (
      <Container className="p-6">
        <Text>Yükleniyor...</Text>
      </Container>
    )
  }

  return (
    <Container className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Heading level="h1">Mağaza Ayarları</Heading>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-lg border p-4">
          <Heading level="h2">Temel Bilgiler</Heading>
          <div className="space-y-2">
            <Text size="small">Mağaza adı</Text>
            <Input
              value={settings.store_name ?? ""}
              onChange={(event) => updateField("store_name", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text size="small">Mağaza slug</Text>
            <Input
              value={settings.store_slug ?? ""}
              onChange={(event) => updateField("store_slug", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text size="small">Logo URL</Text>
            <Input
              value={settings.logo_url ?? ""}
              onChange={(event) => updateField("logo_url", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text size="small">İletişim e-posta</Text>
            <Input
              value={settings.contact_email ?? ""}
              onChange={(event) => updateField("contact_email", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text size="small">İletişim telefonu</Text>
            <Input
              value={settings.contact_phone ?? ""}
              onChange={(event) => updateField("contact_phone", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text size="small">Adres</Text>
            <Textarea
              value={settings.address ?? ""}
              onChange={(event) => updateField("address", event.target.value)}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-lg border p-4">
          <Heading level="h2">Görünüm ve Tema</Heading>
          <Select
            value={settings.theme_key ?? "classic"}
            onValueChange={(value) => updateField("theme_key", value as any)}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {themeOptions.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>

          <div className="space-y-2">
            <Text size="small">Birincil renk</Text>
            <Input
              value={settings.primary_color ?? "#111827"}
              onChange={(event) => updateField("primary_color", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text size="small">İkincil renk</Text>
            <Input
              value={settings.secondary_color ?? "#f59e0b"}
              onChange={(event) => updateField("secondary_color", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Text size="small">İade politikası</Text>
            <Textarea
              value={settings.return_policy ?? ""}
              onChange={(event) => updateField("return_policy", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text size="small">Kargo politikası</Text>
            <Textarea
              value={settings.shipping_policy ?? ""}
              onChange={(event) => updateField("shipping_policy", event.target.value)}
            />
          </div>
        </section>
      </div>

      <section className="space-y-4 rounded-lg border p-4">
        <Heading level="h2">Varsayılan İşleyiş Ayarları</Heading>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Select
            value={settings.default_region_id ?? ""}
            onValueChange={(value) => updateField("default_region_id", value)}
          >
            <Select.Trigger>
              <Select.Value placeholder="Bölge seçin" />
            </Select.Trigger>
            <Select.Content>
              {optionMap.regions.map((option) => (
                <Select.Item key={option.id} value={option.id}>
                  {option.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>

          <div className="space-y-2">
            <Text size="small">Para birimi</Text>
            <Input
              value={settings.default_currency_code ?? "TRY"}
              onChange={(event) => updateField("default_currency_code", event.target.value)}
            />
          </div>

          <Select
            value={settings.default_sales_channel_id ?? ""}
            onValueChange={(value) => updateField("default_sales_channel_id", value)}
          >
            <Select.Trigger>
              <Select.Value placeholder="Satış kanalı seçin" />
            </Select.Trigger>
            <Select.Content>
              {optionMap.sales_channels.map((option) => (
                <Select.Item key={option.id} value={option.id}>
                  {option.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>

          <Select
            value={settings.default_shipping_profile_id ?? ""}
            onValueChange={(value) => updateField("default_shipping_profile_id", value)}
          >
            <Select.Trigger>
              <Select.Value placeholder="Kargo profili seçin" />
            </Select.Trigger>
            <Select.Content>
              {optionMap.shipping_profiles.map((option) => (
                <Select.Item key={option.id} value={option.id}>
                  {option.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>

          <Select
            value={settings.default_shipping_option_id ?? ""}
            onValueChange={(value) => updateField("default_shipping_option_id", value)}
          >
            <Select.Trigger>
              <Select.Value placeholder="Kargo yöntemi seçin" />
            </Select.Trigger>
            <Select.Content>
              {optionMap.shipping_options.map((option) => (
                <Select.Item key={option.id} value={option.id}>
                  {option.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>

          <Select
            value={settings.default_stock_location_id ?? ""}
            onValueChange={(value) => updateField("default_stock_location_id", value)}
          >
            <Select.Trigger>
              <Select.Value placeholder="Depo seçin" />
            </Select.Trigger>
            <Select.Content>
              {optionMap.stock_locations.map((option) => (
                <Select.Item key={option.id} value={option.id}>
                  {option.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>

          <Select
            value={settings.default_payment_provider_id ?? ""}
            onValueChange={(value) => updateField("default_payment_provider_id", value)}
          >
            <Select.Trigger>
              <Select.Value placeholder="Ödeme sağlayıcısı seçin" />
            </Select.Trigger>
            <Select.Content>
              {optionMap.payment_providers.map((option) => (
                <Select.Item key={option.id} value={option.id}>
                  {option.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>

          <div className="space-y-2">
            <Text size="small">Kargo ücreti</Text>
            <Input
              type="number"
              value={String(settings.shipping_fee ?? 0)}
              onChange={(event) => updateField("shipping_fee", Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Text size="small">Ücretsiz kargo limiti</Text>
            <Input
              type="number"
              value={String(settings.free_shipping_limit ?? 0)}
              onChange={(event) => updateField("free_shipping_limit", Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Text size="small">Tahmini teslimat süresi (gün)</Text>
            <Input
              type="number"
              value={String(settings.estimated_delivery_days ?? 3)}
              onChange={(event) => updateField("estimated_delivery_days", Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Text size="small">Ülke kodu</Text>
            <Input
              value={settings.country_code ?? "TR"}
              onChange={(event) => updateField("country_code", event.target.value)}
            />
          </div>
        </div>
      </section>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Store Settings",
})

export default StoreSettingsPage
