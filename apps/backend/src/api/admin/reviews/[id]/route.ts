import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { REVIEW_MODULE } from "../../../../modules/reviews"
import ReviewModuleService from "../../../../modules/reviews/service"

type UpdateReviewBody = {
  status: "approved" | "rejected" | "pending"
}

// POST /admin/reviews/:id -> durumunu günceller (onayla / reddet)
export async function POST(
  req: MedusaRequest<UpdateReviewBody>,
  res: MedusaResponse
): Promise<void> {
  const reviewModuleService: ReviewModuleService = req.scope.resolve(
    REVIEW_MODULE
  )
  const { id } = req.params
  const { status } = req.body

  if (!["approved", "rejected", "pending"].includes(status)) {
    res.status(400).json({ message: "Geçersiz status değeri." })
    return
  }

  const review = await reviewModuleService.updateReviews({
    id,
    status,
  })

  res.json({ review })
}

// DELETE /admin/reviews/:id -> yorumu tamamen siler
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const reviewModuleService: ReviewModuleService = req.scope.resolve(
    REVIEW_MODULE
  )
  const { id } = req.params

  await reviewModuleService.deleteReviews([id])

  res.json({ id, object: "review", deleted: true })
}
