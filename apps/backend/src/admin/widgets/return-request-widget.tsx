import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"
import {
  Container,
  Heading,
  Badge,
  Button,
  Text,
  Textarea,
  Input,
  Select,
} from "@medusajs/ui"
import { useEffect, useState } from "react"

type ReturnRequest = {
  id: string
  type: "return" | "cancellation"
  customer_name: string
  customer_email: string
  item_description: string
  reason: string
  status: "pending" | "approved" | "rejected" | "refunded"
  admin_note?: string
  return_carrier?: string | null
  return_code?: string | null
  return_instructions?: string | null
  created_at: string
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Beklemede",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  refunded: "İade Edildi",
}

const TYPE_LABELS: Record<string, string> = {
  return: "İade Talebi",
  cancellation: "İptal Talebi",
}

const CARRIERS = [
  { value: "yurtici", label: "Yurtiçi Kargo" },
  { value: "aras", label: "Aras Kargo" },
  { value: "mng", label: "MNG Kargo" },
  { value: "ptt", label: "PTT Kargo" },
  { value: "surat", label: "Sürat Kargo" },
  { value: "ups", label: "UPS" },
  { value: "other", label: "Diğer" },
]

const ReturnRequestWidget = ({ data: order }: DetailWidgetProps<AdminOrder>) => {
  const [requests, setRequests] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [shippingForms, setShippingForms] = useState<
    Record<string, { carrier: string; code: string; instructions: string }>
  >({})

  const fetchAll = async () => {
    const res = await fetch(`/admin/return-requests`, { credentials: "include" })
    const json = await res.json()
    const filtered = (json.return_requests ?? []).filter(
      (r: any) => r.order_id === order.id
    )
    setRequests(filtered)
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()
  }, [order.id])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/admin/return-requests/${id}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, admin_note: notes[id] }),
    })
    fetchAll()
  }

  const saveShippingCode = async (id: string) => {
    const form = shippingForms[id]
    if (!form?.carrier || !form?.code) return

    await fetch(`/admin/return-requests/${id}/shipping-code`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        return_carrier: form.carrier,
        return_code: form.code,
        return_instructions: form.instructions,
      }),
    })
    fetchAll()
  }

  if (!loading && requests.length === 0) {
    return null
  }

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Heading level="h2">İade / İptal Talepleri</Heading>
        {requests.length > 0 && <Badge>{requests.length}</Badge>}
      </div>

      <div className="flex flex-col gap-3">
        {requests.map((r) => {
          const form = shippingForms[r.id] ?? {
            carrier: r.return_carrier ?? "",
            code: r.return_code ?? "",
            instructions: r.return_instructions ?? "",
          }

          return (
            <div key={r.id} className="border rounded-lg p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Text weight="plus">
                  {TYPE_LABELS[r.type] ?? r.type} — {r.customer_name} —{" "}
                  {r.customer_email}
                </Text>
                <Badge>{STATUS_LABELS[r.status] ?? r.status}</Badge>
              </div>
              <Text size="small">
                <strong>Ürün:</strong> {r.item_description}
              </Text>
              <Text size="small">
                <strong>Sebep:</strong> {r.reason}
              </Text>
              {r.admin_note && (
                <Text size="small" className="text-ui-fg-subtle">
                  <strong>Not:</strong> {r.admin_note}
                </Text>
              )}

              {r.status === "pending" && (
                <>
                  <Textarea
                    placeholder="Admin notu (opsiyonel)"
                    value={notes[r.id] ?? ""}
                    onChange={(e) =>
                      setNotes({ ...notes, [r.id]: e.target.value })
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      variant="primary"
                      onClick={() => updateStatus(r.id, "approved")}
                    >
                      Onayla
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() => updateStatus(r.id, "rejected")}
                    >
                      Reddet
                    </Button>
                  </div>
                </>
              )}

              {/* Sadece "İade Talebi" (type: return) onaylandıysa iade kargo
                  kodu girişi gösterilir — iptal talebinde ürün zaten kargoya
                  verilmediği için iade kargosuna gerek yoktur. */}
              {r.type === "return" && r.status === "approved" && (
                <div className="border-t pt-3 mt-1 flex flex-col gap-2">
                  <Text size="small" weight="plus">
                    İade Kargo Bilgisi
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    Kargo firmasının kendi portalından oluşturduğunuz iade
                    kodunu buraya girin, müşteri kendi sipariş sayfasında
                    görecek.
                  </Text>

                  <div className="flex gap-2 items-end flex-wrap">
                    <div className="flex-1 min-w-[140px]">
                      <Text size="xsmall" className="mb-1">
                        Kargo Firması
                      </Text>
                      <Select
                        value={form.carrier}
                        onValueChange={(v) =>
                          setShippingForms({
                            ...shippingForms,
                            [r.id]: { ...form, carrier: v },
                          })
                        }
                      >
                        <Select.Trigger>
                          <Select.Value placeholder="Seçin" />
                        </Select.Trigger>
                        <Select.Content>
                          {CARRIERS.map((c) => (
                            <Select.Item key={c.value} value={c.value}>
                              {c.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </div>
                    <div className="flex-1 min-w-[140px]">
                      <Text size="xsmall" className="mb-1">
                        İade Kodu
                      </Text>
                      <Input
                        value={form.code}
                        onChange={(e) =>
                          setShippingForms({
                            ...shippingForms,
                            [r.id]: { ...form, code: e.target.value },
                          })
                        }
                        placeholder="Örn. IAD123456"
                      />
                    </div>
                  </div>
                  <Textarea
                    placeholder="Müşteriye not (opsiyonel) — örn. 'En yakın şubeye bu kodla teslim edin'"
                    value={form.instructions}
                    onChange={(e) =>
                      setShippingForms({
                        ...shippingForms,
                        [r.id]: { ...form, instructions: e.target.value },
                      })
                    }
                  />
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => saveShippingCode(r.id)}
                  >
                    {r.return_code ? "Güncelle" : "Kaydet"}
                  </Button>

                  {r.return_code && (
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      Kayıtlı: {CARRIERS.find((c) => c.value === r.return_carrier)?.label}{" "}
                      — {r.return_code}
                    </Text>
                  )}
                </div>
              )}

              {r.status === "approved" && (
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => updateStatus(r.id, "refunded")}
                >
                  İade Edildi Olarak İşaretle
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default ReturnRequestWidget
