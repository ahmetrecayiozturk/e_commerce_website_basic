"use client"

import { useEffect, useState } from "react"

type Tracking = {
  id: string
  carrier: string
  carrier_name?: string
  tracking_number: string
  tracking_url?: string
  status: string
  status_history: { status: string; note?: string; created_at: string }[]
}

const CARRIER_LABELS: Record<string, string> = {
  yurtici: "Yurtiçi Kargo",
  aras: "Aras Kargo",
  mng: "MNG Kargo",
  ptt: "PTT Kargo",
  surat: "Sürat Kargo",
  ups: "UPS",
  other: "Kargo",
}

const STATUS_LABELS: Record<string, string> = {
  preparing: "Hazırlanıyor",
  shipped: "Kargoya verildi",
  in_transit: "Yolda",
  out_for_delivery: "Dağıtıma çıktı",
  delivered: "Teslim edildi",
  failed: "Teslim edilemedi",
}

export default function OrderTracking({ orderId }: { orderId: string }) {
  const [trackings, setTrackings] = useState<Tracking[]>([])
  const [loading, setLoading] = useState(true)

  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await fetch(
          `${backendUrl}/store/orders/${orderId}/tracking`,
          { headers: { "x-publishable-api-key": publishableKey } }
        )
        const data = await res.json()
        setTrackings(data.trackings ?? [])
      } finally {
        setLoading(false)
      }
    }
    fetchTracking()
  }, [orderId])

  if (loading) {
    return null
  }

  if (trackings.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-4 border-b border-gray-200 pb-8">
      <h2 className="text-large-semi">Kargo Takibi</h2>
      {trackings.map((t) => (
        <div key={t.id} className="border rounded-lg p-4 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">
              {t.carrier_name || CARRIER_LABELS[t.carrier] || t.carrier} —{" "}
              {t.tracking_number}
            </span>
            <span className="text-sm bg-gray-100 px-2 py-1 rounded">
              {STATUS_LABELS[t.status] ?? t.status}
            </span>
          </div>

          {t.tracking_url && (
            <a
              href={t.tracking_url}
              target="_blank"
              rel="noreferrer"
              className="text-ui-fg-interactive text-sm underline"
            >
              Kargo firmasının sitesinde sorgula
            </a>
          )}

          {t.status_history?.length > 0 && (
            <ol className="mt-2 border-l pl-4 flex flex-col gap-2">
              {t.status_history.map((h, i) => (
                <li key={i}>
                  <div className="font-medium text-sm">
                    {STATUS_LABELS[h.status] ?? h.status}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(h.created_at).toLocaleString("tr-TR")}
                  </div>
                  {h.note && <div className="text-sm">{h.note}</div>}
                </li>
              ))}
            </ol>
          )}
        </div>
      ))}
    </div>
  )
}