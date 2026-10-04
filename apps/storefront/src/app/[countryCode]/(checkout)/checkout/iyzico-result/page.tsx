"use client"

import { placeOrder } from "@lib/data/cart"
import { useEffect, useState } from "react"

export default function IyzicoResultPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    placeOrder()
      .catch((err: any) => {
        // Next.js'in kendi yönlendirme mekanizması, client tarafında
        // otomatik olarak ele alınır; burada sadece gerçek hataları yakalıyoruz.
        if (err?.digest?.startsWith?.("NEXT_REDIRECT")) {
          return
        }
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="content-container py-24 text-center">
        <h1 className="text-2xl-semi mb-4">Ödemeniz işleniyor...</h1>
        <p className="text-ui-fg-subtle">Lütfen bekleyin, yönlendiriliyorsunuz.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="content-container py-24 text-center">
        <h1 className="text-2xl-semi mb-4">Ödeme tamamlanamadı</h1>
        <p className="text-ui-fg-subtle mb-6">{error}</p>
        <a href="/tr/checkout" className="text-ui-fg-interactive underline">
          Tekrar deneyin
        </a>
      </div>
    )
  }

  return null
}