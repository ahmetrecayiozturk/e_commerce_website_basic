"use client"

import { useEffect, useState } from "react"

type CancellationRequest = {
  id: string
  item_description: string
  reason: string
  status: "pending" | "approved" | "rejected" | "refunded"
  admin_note?: string
  created_at: string
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Beklemede",
  approved: "Onaylandı, siparişiniz iptal edilecek",
  rejected: "Reddedildi",
  refunded: "İptal Edildi",
}

export default function OrderCancellationRequest({
  orderId,
  orderDisplayId,
  customerEmail,
  hasFulfillment,
}: {
  orderId: string
  orderDisplayId: number
  customerEmail: string
  hasFulfillment: boolean
}) {
  const [requests, setRequests] = useState<CancellationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    customer_name: "",
    item_description: "",
    reason: "",
  })

  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!

  const fetchRequests = async () => {
    try {
      const res = await fetch(
        `${backendUrl}/store/orders/${orderId}/cancellation-requests`,
        { headers: { "x-publishable-api-key": publishableKey } }
      )
      const data = await res.json()
      setRequests(data.cancellation_requests ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [orderId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const res = await fetch(
      `${backendUrl}/store/orders/${orderId}/cancellation-requests`,
      {
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
      }
    )
    if (!res.ok) {
      const data = await res.json()
      setError(data.message ?? "Bir hata oluştu.")
      return
    }
    setSubmitted(true)
    setShowForm(false)
    fetchRequests()
  }

  if (loading) {
    return null
  }

  // Zaten kargoya verilmişse iptal seçeneği hiç gösterilmez (iade akışı devreye girer)
  if (hasFulfillment && requests.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-4 border-b border-gray-200 pb-8">
      <h2 className="text-large-semi">Sipariş İptali</h2>

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
            </div>
          ))}
        </div>
      )}

      {submitted && (
        <p className="text-sm text-green-600">
          İptal talebiniz alındı, incelendikten sonra size dönüş yapılacak.
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!showForm && !submitted && requests.length === 0 && (
        <button
          onClick={() => setShowForm(true)}
          className="text-ui-fg-interactive underline text-sm self-start"
        >
          Bu siparişi iptal etmek istiyorum
        </button>
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
            placeholder="Hangi ürün(ler)?"
            className="border rounded p-2"
            value={form.item_description}
            onChange={(e) =>
              setForm({ ...form, item_description: e.target.value })
            }
          />
          <textarea
            required
            placeholder="İptal sebebi"
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