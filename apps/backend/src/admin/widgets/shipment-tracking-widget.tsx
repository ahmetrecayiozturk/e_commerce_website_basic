import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"
import { Container, Heading, Button, Input, Select, Text, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

const CARRIERS = [
  { value: "yurtici", label: "Yurtiçi Kargo" },
  { value: "aras", label: "Aras Kargo" },
  { value: "mng", label: "MNG Kargo" },
  { value: "ptt", label: "PTT Kargo" },
  { value: "surat", label: "Sürat Kargo" },
  { value: "ups", label: "UPS" },
  { value: "other", label: "Diğer" },
]

const STATUS_LABELS: Record<string, string> = {
  preparing: "Hazırlanıyor",
  shipped: "Kargoya verildi",
  in_transit: "Yolda",
  out_for_delivery: "Dağıtıma çıktı",
  delivered: "Teslim edildi",
  failed: "Teslim edilemedi",
}

const ShipmentTrackingWidget = ({
  data: order,
}: DetailWidgetProps<AdminOrder>) => {
  const [trackings, setTrackings] = useState<any[]>([])
  const [carrier, setCarrier] = useState("yurtici")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchTrackings = async () => {
    const res = await fetch(`/admin/orders/${order.id}/tracking`, {
      credentials: "include",
    })
    const json = await res.json()
    setTrackings(json.trackings ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchTrackings()
  }, [order.id])

  const addTracking = async () => {
    if (!trackingNumber) return
    await fetch(`/admin/orders/${order.id}/tracking`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carrier, tracking_number: trackingNumber }),
    })
    setTrackingNumber("")
    fetchTrackings()
  }

  const advanceStatus = async (trackingId: string, status: string) => {
    await fetch(`/admin/orders/${order.id}/tracking/${trackingId}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    fetchTrackings()
  }

  return (
    <Container className="p-6">
      <Heading level="h2" className="mb-4">
        Kargo Takip
      </Heading>

      {!loading &&
        trackings.map((t) => (
          <div key={t.id} className="border rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <Text weight="plus">
                {CARRIERS.find((c) => c.value === t.carrier)?.label ?? t.carrier} —{" "}
                {t.tracking_number}
              </Text>
              <Badge>{STATUS_LABELS[t.status] ?? t.status}</Badge>
            </div>
            {t.tracking_url && (
              <a
                href={t.tracking_url}
                target="_blank"
                rel="noreferrer"
                className="text-ui-fg-interactive text-sm"
              >
                Kargo firmasında sorgula →
              </a>
            )}
            <div className="flex gap-2 mt-2 flex-wrap">
              {Object.keys(STATUS_LABELS).map((s) => (
                <Button
                  key={s}
                  size="small"
                  variant={t.status === s ? "primary" : "secondary"}
                  onClick={() => advanceStatus(t.id, s)}
                >
                  {STATUS_LABELS[s]}
                </Button>
              ))}
            </div>
          </div>
        ))}

      <div className="flex gap-2 items-end mt-4 pt-4 border-t">
        <div className="flex-1">
          <Text size="small" className="mb-1">
            Kargo Firması
          </Text>
          <Select value={carrier} onValueChange={setCarrier}>
            <Select.Trigger>
              <Select.Value />
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
        <div className="flex-1">
          <Text size="small" className="mb-1">
            Takip Numarası
          </Text>
          <Input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Örn. 123456789012"
          />
        </div>
        <Button onClick={addTracking}>Ekle</Button>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default ShipmentTrackingWidget
