import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { REVIEW_MODULE } from "../../../../../modules/reviews"
import ReviewModuleService from "../../../../../modules/reviews/service"

// GET /store/products/:id/reviews  -> onaylanmış yorumları + ortalama puanı döner
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const reviewModuleService: ReviewModuleService = req.scope.resolve(
    REVIEW_MODULE
  )
  const productId = req.params.id

  const reviews = await reviewModuleService.listReviews(
    { product_id: productId, status: "approved" },
    { order: { created_at: "DESC" } }
  )
  const summary = await reviewModuleService.getProductRatingSummary(
    productId
  )

  res.json({ reviews, summary })
}

type CreateReviewBody = {
  customer_name: string
  rating: number
  title?: string
  content: string
  order_id?: string
}

// POST /store/products/:id/reviews -> yeni yorum oluşturur (durumu "pending" olur,
// admin panelden onaylanana kadar mağazada görünmez)
export async function POST(
  req: MedusaRequest<CreateReviewBody>,
  res: MedusaResponse
): Promise<void> {
  const reviewModuleService: ReviewModuleService = req.scope.resolve(
    REVIEW_MODULE
  )
  const productId = req.params.id
  const { customer_name, rating, title, content, order_id } = req.body

  if (!customer_name || !content || !rating) {
    res.status(400).json({
      message: "customer_name, rating ve content alanları zorunludur.",
    })
    return
  }

  if (rating < 1 || rating > 5) {
    res.status(400).json({ message: "rating 1 ile 5 arasında olmalıdır." })
    return
  }

  // req.auth_context varsa (müşteri giriş yapmışsa) customer_id otomatik alınır
  const customerId = (req as any).auth_context?.actor_id ?? null

  const review = await reviewModuleService.createReviews({
    product_id: productId,
    customer_id: customerId,
    customer_name,
    rating,
    title,
    content,
    order_id,
    status: "pending",
  })

  res.status(201).json({ review })
}
