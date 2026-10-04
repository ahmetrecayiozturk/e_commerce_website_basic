"use client"

import { useEffect, useState } from "react"

type Review = {
  id: string
  customer_name: string
  rating: number
  title?: string
  content: string
  created_at: string
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState({ average: 0, count: 0 })
  const [form, setForm] = useState({
    customer_name: "",
    rating: 5,
    title: "",
    content: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!

  const fetchReviews = async () => {
    const res = await fetch(
      `${backendUrl}/store/products/${productId}/reviews`,
      { headers: { "x-publishable-api-key": publishableKey } }
    )
    const data = await res.json()
    setReviews(data.reviews ?? [])
    setSummary(data.summary ?? { average: 0, count: 0 })
  }

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch(`${backendUrl}/store/products/${productId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": publishableKey,
      },
      body: JSON.stringify(form),
    })
    setSubmitted(true)
    setForm({ customer_name: "", rating: 5, title: "", content: "" })
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-lg font-semibold mb-2">
        Değerlendirmeler {summary.count > 0 && `(${summary.count})`}
      </h2>
      {summary.count > 0 && (
        <p className="mb-6 text-sm text-gray-600">
          Ortalama puan: {"★".repeat(Math.round(summary.average))}
          {"☆".repeat(5 - Math.round(summary.average))} ({summary.average}/5)
        </p>
      )}

      <div className="flex flex-col gap-4 mb-8">
        {reviews.map((r) => (
          <div key={r.id} className="border rounded-lg p-4">
            <div className="flex justify-between">
              <span className="font-medium">{r.customer_name}</span>
              <span>
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </span>
            </div>
            {r.title && <div className="font-medium mt-1">{r.title}</div>}
            <p className="text-sm mt-1">{r.content}</p>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-sm text-gray-500">
            Bu ürün için henüz onaylanmış yorum yok.
          </p>
        )}
      </div>

      {submitted ? (
        <p className="text-sm text-green-600">
          Yorumunuz alındı, onaylandıktan sonra yayınlanacak. Teşekkürler!
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3 max-w-md">
          <h3 className="font-medium">Yorum Yaz</h3>
          <input
            required
            placeholder="Adınız"
            className="border rounded p-2"
            value={form.customer_name}
            onChange={(e) =>
              setForm({ ...form, customer_name: e.target.value })
            }
          />
          <select
            className="border rounded p-2"
            value={form.rating}
            onChange={(e) =>
              setForm({ ...form, rating: Number(e.target.value) })
            }
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} yıldız
              </option>
            ))}
          </select>
          <input
            placeholder="Başlık (opsiyonel)"
            className="border rounded p-2"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            required
            placeholder="Yorumunuz"
            className="border rounded p-2"
            rows={4}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <button
            type="submit"
            className="bg-black text-white rounded p-2 hover:opacity-90"
          >
            Gönder
          </button>
        </form>
      )}
    </div>
  )
}