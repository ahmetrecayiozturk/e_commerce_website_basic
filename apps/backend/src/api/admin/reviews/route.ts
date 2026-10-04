import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { REVIEW_MODULE } from "../../../modules/reviews"
import ReviewModuleService from "../../../modules/reviews/service"

// GET /admin/reviews?status=pending -> admin panelde moderasyon listesi
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const reviewModuleService: ReviewModuleService = req.scope.resolve(
    REVIEW_MODULE
  )
  const status = req.query.status as string | undefined

  const filters = status ? { status } : {}

  const reviews = await reviewModuleService.listReviews(filters, {
    order: { created_at: "DESC" },
  })

  res.json({ reviews, count: reviews.length })
}
