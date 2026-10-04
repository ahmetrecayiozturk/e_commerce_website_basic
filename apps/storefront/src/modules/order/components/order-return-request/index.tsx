"use client"

import { useEffect, useState } from "react"

type ReturnRequest = {
  id: string
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

const CARRIER_LABELS: Record<string, string> = {
  yurtici: "Yurtiçi Kargo",
  aras: "Aras Kargo",
  mng: "MNG Kargo",
  ptt: "PTT Kargo",
  surat: "Sürat Kargo",
  ups: "UPS",
  other: "Kargo",
}

export default function OrderReturnRequest({
  orderId,
  orderDisplayId,
  customerEmail,
  fulfillmentStatus,
}: {
  orderId: string
  orderDisplayId: number
  customerEmail: string
  fulfillmentStatus: string
}) {
  const [requests, setRequests] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    customer_name: "",
    item_description: "",
    reason: "",
  })

  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!

  const fetchReviews = async () => {
    const res = await fetch(
      `${backendUrl}/store/orders/${orderId}/return-requests`,
      { headers: { "x-publishable-api-key": publishableKey } }
    )
    const data = await res.json()
    setRequests(data.return_requests ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchReviews()
  }, [orderId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch(`${backendUrl}/store/orders/${orderId}/return-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": publishableKey,
      },
      body: JSON.stringify({
        order_display_id: orderDisplayId,
        customer_email: customerEmail,
        customer_name: form.customer_name,
        item_description: form.item_description,
        reason: form.reason,
      }),
    })
    setSubmitted(true)
    setShowForm(false)
    fetchReviews()
  }

  if (loading) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-4 border-b border-gray-200 pb-8">
      <h2 className="text-large-semi">İade Talebi</h2>

      {requests.length > 0 && (
        <div className="flex flex-col gap-3">
          {requests.map((r) => (
            <div key={r.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{r.item_description}</span>
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {STATUS_LABELS[r.status] ?? r.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">Sebep: {r.reason}</p>
              {r.admin_note && (
                <p className="text-sm text-gray-600 mt-1">
                  Not: {r.admin_note}
                </p>
              )}

              {r.return_code && (
                <div className="mt-3 border-t pt-3 bg-gray-50 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg">
                  <p className="text-sm font-medium mb-1">
                    İade Kargo Bilgisi
                  </p>
                  <p className="text-sm">
                    {CARRIER_LABELS[r.return_carrier ?? ""] ??
                      r.return_carrier}{" "}
                    — Kod:{" "}
                    <span className="font-mono font-semibold">
                      {r.return_code}
                    </span>
                  </p>
                  {r.return_instructions && (
                    <p className="text-sm text-gray-600 mt-1">
                      {r.return_instructions}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {submitted && (
        <p className="text-sm text-green-600">
          İade talebiniz alındı, incelendikten sonra size dönüş yapılacak.
        </p>
      )}

      {!showForm &&
        !submitted &&
        fulfillmentStatus === "delivered" &&
        requests.length === 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="text-ui-fg-interactive underline text-sm self-start"
          >
            Bu sipariş için iade talebi oluştur
          </button>
        )}

      {!showForm &&
        !submitted &&
        fulfillmentStatus !== "delivered" &&
        requests.length === 0 && (
          <p className="text-sm text-gray-500">
            İade talebi oluşturmak için siparişinizin teslim edilmiş olması
            gerekir. Şu anki durum: {fulfillmentStatus}
          </p>
        )}

      {showForm && (
        <form onSubmit={submit} className="flex flex-col gap-3 max-w-md">
          <input
            required
            placeholder="Adınız Soyadınız"
            className="border rounded p-2"
            value={form.customer_name}
            onChange={(e) =>
              setForm({ ...form, customer_name: e.target.value })
            }
          />
          <input
            required
            placeholder="Hangi ürün(ler)? (örn. Medusa Sweatshirt - M beden)"
            className="border rounded p-2"
            value={form.item_description}
            onChange={(e) =>
              setForm({ ...form, item_description: e.target.value })
            }
          />
          <textarea
            required
            placeholder="İade sebebi"
            className="border rounded p-2"
            rows={3}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-black text-white rounded p-2 px-4 hover:opacity-90"
            >
              Talebi Gönder
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-gray-500"
            >
              Vazgeç
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
