import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Input, Text, Textarea } from "@medusajs/ui"
import { useEffect, useState } from "react"

type StoreSettings = {
  store_name?: string
  store_slug?: string
  logo_url?: string
  contact_email?: string
  contact_phone?: string
  address?: string
  return_policy?: string
  shipping_policy?: string
  primary_color?: string
  secondary_color?: string
  shipping_fee?: number
  free_shipping_limit?: number
  estimated_delivery_days?: number
}

const emptySettings: StoreSettings = {
  store_name: "",
  store_slug: "",
  logo_url: "",
  contact_email: "",
  contact_phone: "",
  address: "",
  return_policy: "",
  shipping_policy: "",
  primary_color: "#111827",
  secondary_color: "#f59e0b",
  shipping_fee: 0,
  free_shipping_limit: 0,
  estimated_delivery_days: 3,
}

const StoreSettingsPage = () => {
  const [settings, setSettings] = useState<StoreSettings>(emptySettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const loadSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/admin/store-settings", { credentials: "include" })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Mağaza ayarları yüklenemedi.")
      }
      setSettings({ ...emptySettings, ...data.store_settings })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Mağaza ayarları yüklenemedi.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadSettings()
  }, [])

  const updateField = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  const saveSettings = async () => {
    setSaving(true)
    setMessage("")
    try {
      const response = await fetch("/admin/store-settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Mağaza ayarları kaydedilemedi.")
      }
      setMessage("Mağaza ayarları kaydedildi.")
      setSettings({ ...emptySettings, ...data.store_settings })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Mağaza ayarları kaydedilemedi.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Container className="p-6"><Text>Yükleniyor...</Text></Container>
  }

  return (
    <Container className="max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Mağaza Ayarları</Heading>
          <Text className="mt-1 text-ui-fg-subtle">
            Türkiye satışları için temel mağaza bilgilerini yönetin.
          </Text>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
        </Button>
      </div>

      {message && <div className="rounded-lg border p-4"><Text>{message}</Text></div>}

      <section className="space-y-4 rounded-lg border p-4">
        <Heading level="h2">Mağaza Bilgileri</Heading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Mağaza adı" value={settings.store_name} onChange={(value) => updateField("store_name", value)} />
          <Field label="Mağaza adresi" value={settings.store_slug} onChange={(value) => updateField("store_slug", value)} />
          <Field label="Logo URL" value={settings.logo_url} onChange={(value) => updateField("logo_url", value)} />
          <Field label="İletişim e-posta" value={settings.contact_email} onChange={(value) => updateField("contact_email", value)} />
          <Field label="İletişim telefonu" value={settings.contact_phone} onChange={(value) => updateField("contact_phone", value)} />
        </div>
        <Field label="Adres" value={settings.address} onChange={(value) => updateField("address", value)} multiline />
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <Heading level="h2">Kargo ve Politikalar</Heading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <NumberField label="Kargo ücreti (TL)" value={settings.shipping_fee} onChange={(value) => updateField("shipping_fee", value)} />
          <NumberField label="Ücretsiz kargo limiti (TL)" value={settings.free_shipping_limit} onChange={(value) => updateField("free_shipping_limit", value)} />
          <NumberField label="Teslimat süresi (gün)" value={settings.estimated_delivery_days} onChange={(value) => updateField("estimated_delivery_days", value)} />
        </div>
        <Field label="İade politikası" value={settings.return_policy} onChange={(value) => updateField("return_policy", value)} multiline />
        <Field label="Kargo politikası" value={settings.shipping_policy} onChange={(value) => updateField("shipping_policy", value)} multiline />
      </section>

      <div className="rounded-lg border bg-ui-bg-subtle p-4">
        <Text weight="plus">Türkiye altyapısı otomatik aktif</Text>
        <Text size="small" className="mt-1 text-ui-fg-subtle">
          Para birimi TRY, ülke Türkiye ve ödeme sağlayıcısı iyzico olarak sistem tarafından yönetilir.
        </Text>
      </div>
    </Container>
  )
}

const Field = ({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string
  value?: string
  onChange: (value: string) => void
  multiline?: boolean
}) => (
  <div className="space-y-2">
    <Text size="small">{label}</Text>
    {multiline ? (
      <Textarea value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
    ) : (
      <Input value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
    )}
  </div>
)

const NumberField = ({
  label,
  value,
  onChange,
}: {
  label: string
  value?: number
  onChange: (value: number) => void
}) => (
  <div className="space-y-2">
    <Text size="small">{label}</Text>
    <Input type="number" value={String(value ?? 0)} onChange={(event) => onChange(Number(event.target.value))} />
  </div>
)

export const config = defineRouteConfig({ label: "Store Settings" })

export default StoreSettingsPage
