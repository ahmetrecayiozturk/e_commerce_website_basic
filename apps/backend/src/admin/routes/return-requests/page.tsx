import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Select,
  Text,
  Textarea,
} from "@medusajs/ui"
import { useEffect, useState } from "react"

type ReturnRequest = {
  id: string
  order_id: string
  order_display_id?: number
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

const statusLabels: Record<ReturnRequest["status"], string> = {
  pending: "Beklemede",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  refunded: "İade edildi",
}

const typeLabels: Record<ReturnRequest["type"], string> = {
  return: "İade",
  cancellation: "İptal",
}

const ReturnRequestsPage = () => {
  const [requests, setRequests] = useState<ReturnRequest[]>([])
  const [status, setStatus] = useState("pending")
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [shipping, setShipping] = useState<
    Record<string, { carrier: string; code: string; instructions: string }>
  >({})

  const loadRequests = async () => {
    setLoading(true)
    const query = status === "all" ? "" : `?status=${status}`
    const response = await fetch(`/admin/return-requests${query}`, {
      credentials: "include",
    })
    const data = await response.json()
    setRequests(data.return_requests ?? [])
    setLoading(false)
  }

  useEffect(() => {
    void loadRequests()
  }, [status])

  const updateStatus = async (
    request: ReturnRequest,
    nextStatus: ReturnRequest["status"]
  ) => {
    await fetch(`/admin/return-requests/${request.id}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: nextStatus,
        admin_note: notes[request.id]?.trim() || undefined,
      }),
    })
    await loadRequests()
  }

  const saveShipping = async (request: ReturnRequest) => {
    const value = shipping[request.id]
    if (!value?.carrier || !value.code.trim()) return

    await fetch(`/admin/return-requests/${request.id}/shipping-code`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        return_carrier: value.carrier,
        return_code: value.code.trim(),
        return_instructions: value.instructions.trim() || undefined,
      }),
    })
    await loadRequests()
  }

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">İade ve İptal Talepleri</Heading>
        <Select value={status} onValueChange={setStatus}>
          <Select.Trigger className="w-48">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="pending">Bekleyenler</Select.Item>
            <Select.Item value="approved">Onaylananlar</Select.Item>
            <Select.Item value="rejected">Reddedilenler</Select.Item>
            <Select.Item value="refunded">İade edilenler</Select.Item>
            <Select.Item value="all">Tümü</Select.Item>
          </Select.Content>
        </Select>
      </div>

      {loading && <Text>Yükleniyor...</Text>}
      {!loading && requests.length === 0 && (
        <Text className="text-ui-fg-subtle">Bu filtrede talep yok.</Text>
      )}

      <div className="flex flex-col gap-3">
        {requests.map((request) => {
          const expanded = expandedId === request.id
          const shippingValue = shipping[request.id] ?? {
            carrier: request.return_carrier ?? "",
            code: request.return_code ?? "",
            instructions: request.return_instructions ?? "",
          }

          return (
            <div key={request.id} className="border rounded-lg overflow-hidden">
              <button
                className="w-full text-left p-4 flex items-center justify-between hover:bg-ui-bg-subtle"
                onClick={() =>
                  setExpandedId(expanded ? null : request.id)
                }
              >
                <div>
                  <Text weight="plus">
                    {typeLabels[request.type]}{" "}
                    {request.order_display_id
                      ? `- Sipariş #${request.order_display_id}`
                      : ""}
                  </Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    {request.customer_name} - {request.customer_email}
                  </Text>
                </div>
                <Badge>{statusLabels[request.status]}</Badge>
              </button>

              {expanded && (
                <div className="border-t p-4 flex flex-col gap-3 bg-ui-bg-subtle">
                  <Text size="small">
                    <strong>Ürün:</strong> {request.item_description}
                  </Text>
                  <Text size="small">
                    <strong>Sebep:</strong> {request.reason}
                  </Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    {new Date(request.created_at).toLocaleString("tr-TR")}
                  </Text>

                  {request.status === "pending" && (
                    <>
                      <Textarea
                        placeholder="Admin notu (opsiyonel)"
                        value={notes[request.id] ?? ""}
                        onChange={(event) =>
                          setNotes({
                            ...notes,
                            [request.id]: event.target.value,
                          })
                        }
                      />
                      <div className="flex gap-2">
                        <Button
                          size="small"
                          onClick={() => updateStatus(request, "approved")}
                        >
                          Onayla
                        </Button>
                        <Button
                          size="small"
                          variant="danger"
                          onClick={() => updateStatus(request, "rejected")}
                        >
                          Reddet
                        </Button>
                      </div>
                    </>
                  )}

                  {request.status === "approved" &&
                    request.type === "return" && (
                      <>
                        <Select
                          value={shippingValue.carrier}
                          onValueChange={(value) =>
                            setShipping({
                              ...shipping,
                              [request.id]: {
                                ...shippingValue,
                                carrier: value,
                              },
                            })
                          }
                        >
                          <Select.Trigger>
                            <Select.Value placeholder="Kargo firması" />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value="yurtici">
                              Yurtiçi Kargo
                            </Select.Item>
                            <Select.Item value="aras">Aras Kargo</Select.Item>
                            <Select.Item value="mng">MNG Kargo</Select.Item>
                            <Select.Item value="ptt">PTT Kargo</Select.Item>
                            <Select.Item value="other">Diğer</Select.Item>
                          </Select.Content>
                        </Select>
                        <Input
                          placeholder="İade kargo kodu"
                          value={shippingValue.code}
                          onChange={(event) =>
                            setShipping({
                              ...shipping,
                              [request.id]: {
                                ...shippingValue,
                                code: event.target.value,
                              },
                            })
                          }
                        />
                        <Textarea
                          placeholder="Müşteriye gönderilecek talimat"
                          value={shippingValue.instructions}
                          onChange={(event) =>
                            setShipping({
                              ...shipping,
                              [request.id]: {
                                ...shippingValue,
                                instructions: event.target.value,
                              },
                            })
                          }
                        />
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => saveShipping(request)}
                        >
                          Kargo bilgisini kaydet
                        </Button>
                      </>
                    )}

                  {request.status === "approved" && (
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => updateStatus(request, "refunded")}
                    >
                      İade edildi olarak işaretle
                    </Button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Return Requests",
  icon: ChatBubbleLeftRight,
})

export default ReturnRequestsPage
