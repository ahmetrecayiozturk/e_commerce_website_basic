import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Badge, Button, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

type Review = {
  id: string
  product_id: string
  customer_name: string
  rating: number
  title?: string
  content: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

const ReviewModerationWidget = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPending = async () => {
    setLoading(true)
    const res = await fetch(`/admin/reviews?status=pending`, {
      credentials: "include",
    })
    const data = await res.json()
    setReviews(data.reviews ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchPending()
  }, [])

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    await fetch(`/admin/reviews/${id}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    fetchPending()
  }

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Heading level="h2">Onay Bekleyen Yorumlar</Heading>
        <Badge>{reviews.length}</Badge>
      </div>

      {loading && <Text>Yükleniyor...</Text>}
      {!loading && reviews.length === 0 && (
        <Text className="text-ui-fg-subtle">Bekleyen yorum yok.</Text>
      )}

      <div className="flex flex-col gap-3">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="border rounded-lg p-3 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <Text weight="plus">
                {r.customer_name} — {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                Ürün ID: {r.product_id}
              </Text>
            </div>
            {r.title && <Text weight="plus">{r.title}</Text>}
            <Text>{r.content}</Text>
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
          </div>
        ))}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default ReviewModerationWidget
