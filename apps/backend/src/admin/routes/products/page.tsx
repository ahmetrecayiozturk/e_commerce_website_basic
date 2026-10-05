import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Input, Text, Textarea } from "@medusajs/ui"
import { useEffect, useState } from "react"

type ProductRecord = {
  id: string
  title: string
  description?: string
  status?: string
  metadata?: { category_name?: string; stock_quantity?: number }
  variants?: Array<{ prices?: Array<{ amount?: number }>; inventory_quantity?: number }>
}

type ProductDraft = {
  title: string
  category: string
  price: number
  stock_quantity: number
  description: string
}

const emptyProduct: ProductDraft = {
  title: "",
  category: "",
  price: 0,
  stock_quantity: 0,
  description: "",
}

const ProductPage = () => {
  const [products, setProducts] = useState<ProductRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<ProductDraft>(emptyProduct)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const loadProducts = async () => {
    setLoading(true)
    const response = await fetch("/admin/products", { credentials: "include" })
    const data = await response.json()
    setProducts(data.products ?? [])
    setLoading(false)
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  useEffect(() => {
    const product = products.find((item) => item.id === selectedId)
    if (!product) return
    setDraft({
      title: product.title ?? "",
      category: product.metadata?.category_name ?? "",
      price: product.variants?.[0]?.prices?.[0]?.amount ?? 0,
      stock_quantity: product.metadata?.stock_quantity ?? 0,
      description: product.description ?? "",
    })
  }, [selectedId, products])

  const updateDraft = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const createProduct = async () => {
    setSaving(true)
    setMessage("")
    const response = await fetch("/admin/products", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    })
    const data = await response.json()
    setSaving(false)
    if (!response.ok) {
      setMessage(data.message || "Ürün oluşturulamadı.")
      return
    }
    setMessage("Ürün oluşturuldu.")
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
      body: JSON.stringify(draft),
    })
    const data = await response.json()
    setSaving(false)
    setMessage(response.ok ? "Ürün güncellendi." : data.message || "Ürün güncellenemedi.")
    if (response.ok) await loadProducts()
  }

  if (loading) {
    return <Container className="p-6"><Text>Yükleniyor...</Text></Container>
  }

  return (
    <Container className="space-y-6 p-6">
      <div>
        <Heading level="h1">Ürünler</Heading>
        <Text className="mt-1 text-ui-fg-subtle">Ürün adı, kategori, fiyat ve stok adedi girerek ürün ekleyin.</Text>
      </div>
      {message && <div className="rounded-lg border p-4"><Text>{message}</Text></div>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <section className="space-y-3 rounded-lg border p-4">
          <Heading level="h2">Ürün Listesi</Heading>
          {products.map((product) => (
            <button
              key={product.id}
              className={`w-full rounded-md border p-3 text-left ${selectedId === product.id ? "bg-ui-bg-interactive text-white" : "bg-ui-bg-subtle"}`}
              onClick={() => setSelectedId(product.id)}
            >
              <Text weight="plus">{product.title}</Text>
              <Text size="small">{product.metadata?.category_name || "Kategorisiz"} · {product.metadata?.stock_quantity ?? 0} adet</Text>
            </button>
          ))}
          {!products.length && <Text className="text-ui-fg-subtle">Henüz ürün yok.</Text>}
        </section>

        <section className="space-y-4 rounded-lg border p-4">
          <Heading level="h2">{selectedId ? "Ürünü Düzenle" : "Yeni Ürün"}</Heading>
          <Field label="Ürün adı" value={draft.title} onChange={(value) => updateDraft("title", value)} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Kategori" value={draft.category} onChange={(value) => updateDraft("category", value)} />
            <NumberField label="Fiyat (TL)" value={draft.price} onChange={(value) => updateDraft("price", value)} />
            <NumberField label="Stok adedi" value={draft.stock_quantity} onChange={(value) => updateDraft("stock_quantity", value)} />
          </div>
          <Field label="Açıklama" value={draft.description} onChange={(value) => updateDraft("description", value)} multiline />
          <Button onClick={selectedId ? saveUpdate : createProduct} disabled={saving}>
            {saving ? "Kaydediliyor..." : selectedId ? "Değişiklikleri Kaydet" : "Ürünü Oluştur"}
          </Button>
        </section>
      </div>
    </Container>
  )
}

const Field = ({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) => (
  <div className="space-y-2">
    <Text size="small">{label}</Text>
    {multiline ? <Textarea value={value} onChange={(event) => onChange(event.target.value)} /> : <Input value={value} onChange={(event) => onChange(event.target.value)} />}
  </div>
)

const NumberField = ({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) => (
  <div className="space-y-2">
    <Text size="small">{label}</Text>
    <Input type="number" min="0" value={String(value)} onChange={(event) => onChange(Number(event.target.value))} />
  </div>
)

export const config = defineRouteConfig({ label: "Products" })

export default ProductPage
