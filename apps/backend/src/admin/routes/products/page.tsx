import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Input, Select, Text, Textarea } from "@medusajs/ui"
import { useEffect, useState } from "react"

type ProductRecord = {
  id: string
  title: string
  handle?: string
  description?: string
  status?: "draft" | "proposed" | "published" | "rejected"
  discountable?: boolean
  created_at?: string
}

type DraftProduct = {
  title: string
  description: string
  handle: string
  status: "draft" | "proposed" | "published" | "rejected"
  discountable: boolean
  options: Array<{
    title: string
    values: string[]
    is_exclusive: boolean
  }>
  variants: Array<{
    title: string
    sku: string
    options: Record<string, string>
    prices: Array<{ amount: number; currency_code: string }>
    manage_inventory: boolean
    allow_backorder: boolean
  }>
}

const emptyProduct: DraftProduct = {
  title: "",
  description: "",
  handle: "",
  status: "draft",
  discountable: true,
  options: [
    {
      title: "Boyut",
      values: ["S", "M", "L"],
      is_exclusive: true,
    },
  ],
  variants: [
    {
      title: "S",
      sku: "",
      options: { Boyut: "S" },
      prices: [{ amount: 0, currency_code: "TRY" }],
      manage_inventory: true,
      allow_backorder: false,
    },
  ],
}

const ProductPage = () => {
  const [products, setProducts] = useState<ProductRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<DraftProduct>(emptyProduct)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadProducts = async () => {
    setLoading(true)
    const response = await fetch("/admin/products", { credentials: "include" })
    const data = await response.json()
    const list = data.products ?? []
    setProducts(list)
    if (!selectedId && list[0]) {
      setSelectedId(list[0].id)
    }
    setLoading(false)
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  useEffect(() => {
    if (!selectedId) return

    const product = products.find((item) => item.id === selectedId)
    if (!product) return

    setDraft({
      title: product.title ?? "",
      description: product.description ?? "",
      handle: product.handle ?? "",
      status: product.status ?? "draft",
      discountable: product.discountable ?? true,
      options: [
        {
          title: "Boyut",
          values: ["S", "M", "L"],
          is_exclusive: true,
        },
      ],
      variants: [
        {
          title: "Standart",
          sku: "",
          options: { Boyut: "S" },
          prices: [{ amount: 0, currency_code: "TRY" }],
          manage_inventory: true,
          allow_backorder: false,
        },
      ],
    })
  }, [selectedId, products])

  const updateDraft = <K extends keyof DraftProduct>(key: K, value: DraftProduct[K]) => {
    setDraft({
      ...draft,
      [key]: value,
    })
  }

  const createProduct = async () => {
    const response = await fetch("/admin/products", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    })

    const data = await response.json()

    if (!response.ok) {
      alert(data.message || "Ürün oluşturulamadı.")
      return
    }

    alert(data.message || "Ürün oluşturuldu.")
    setDraft(emptyProduct)
    await loadProducts()
  }

  const saveUpdate = async () => {
    if (!selectedId) return

    setSaving(true)
    const response = await fetch(`/admin/products/${selectedId}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: draft.title,
        description: draft.description,
        handle: draft.handle,
        status: draft.status,
        discountable: draft.discountable,
      }),
    })
    const data = await response.json()
    setSaving(false)

    if (!response.ok) {
      alert(data.message || "Ürün güncellenemedi.")
      return
    }

    alert("Ürün güncellendi.")
    await loadProducts()
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
        <Heading level="h1">Ürünler</Heading>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4 rounded-lg border p-4">
          <Heading level="h2">Ürün Listesi</Heading>
          <div className="space-y-2">
            {products.map((product) => (
              <button
                key={product.id}
                className={`w-full rounded-md border p-3 text-left ${
                  selectedId === product.id ? "bg-ui-bg-interactive text-white" : "bg-ui-bg-subtle"
                }`}
                onClick={() => setSelectedId(product.id)}
              >
                <Text weight="plus">{product.title}</Text>
                <Text size="small" className={selectedId === product.id ? "text-white/80" : "text-ui-fg-subtle"}>
                  {product.status ?? "draft"}
                </Text>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border p-4 space-y-4">
            <Heading level="h2">Yeni Ürün</Heading>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Text size="small">Ürün adı</Text>
                <Input
                  value={draft.title}
                  onChange={(event) => updateDraft("title", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Text size="small">Handle</Text>
                <Input
                  value={draft.handle}
                  onChange={(event) => updateDraft("handle", event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Text size="small">Açıklama</Text>
              <Textarea
                value={draft.description}
                onChange={(event) => updateDraft("description", event.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Text size="small">Durum</Text>
                <Select
                  value={draft.status}
                  onValueChange={(value) => updateDraft("status", value as DraftProduct["status"])}
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="draft">Taslak</Select.Item>
                    <Select.Item value="proposed">Önerildi</Select.Item>
                    <Select.Item value="published">Yayınlandı</Select.Item>
                    <Select.Item value="rejected">Reddedildi</Select.Item>
                  </Select.Content>
                </Select>
              </div>

              <div className="space-y-2">
                <Text size="small">İndirimlenebilir</Text>
                <Input
                  type="checkbox"
                  checked={draft.discountable}
                  onChange={(event) => updateDraft("discountable", event.target.checked)}
                />
              </div>
            </div>

            <Button onClick={createProduct}>Ürünü Oluştur</Button>
          </div>

          {selectedId && (
            <div className="rounded-lg border p-4 space-y-4">
              <Heading level="h2">Ürün Düzenle</Heading>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Text size="small">Ürün adı</Text>
                  <Input
                    value={draft.title}
                    onChange={(event) => updateDraft("title", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Text size="small">Handle</Text>
                  <Input
                    value={draft.handle}
                    onChange={(event) => updateDraft("handle", event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Text size="small">Açıklama</Text>
                <Textarea
                  value={draft.description}
                  onChange={(event) => updateDraft("description", event.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Text size="small">Durum</Text>
                  <Select
                    value={draft.status}
                    onValueChange={(value) => updateDraft("status", value as DraftProduct["status"])}
                  >
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="draft">Taslak</Select.Item>
                      <Select.Item value="proposed">Önerildi</Select.Item>
                      <Select.Item value="published">Yayınlandı</Select.Item>
                      <Select.Item value="rejected">Reddedildi</Select.Item>
                    </Select.Content>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Text size="small">İndirimlenebilir</Text>
                  <Input
                    type="checkbox"
                    checked={draft.discountable}
                    onChange={(event) => updateDraft("discountable", event.target.checked)}
                  />
                </div>
              </div>

              <Button onClick={saveUpdate} disabled={saving}>
                {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Products",
})

export default ProductPage
