import { MedusaService } from "@medusajs/framework/utils"
import Review from "./models/review"

// MedusaService, Review modeli için otomatik olarak
// create/list/update/delete/retrieve metodlarını üretir:
// createReviews, listReviews, updateReviews, deleteReviews, retrieveReview ...
class ReviewModuleService extends MedusaService({
  Review,
}) {
  // Bir ürünün ortalama puanını ve toplam yorum sayısını hesaplar
  async getProductRatingSummary(productId: string) {
    const reviews = await this.listReviews({
      product_id: productId,
      status: "approved",
    })

    const count = reviews.length
    const average =
      count === 0
        ? 0
        : Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10
          ) / 10

    return { average, count }
  }
}

export default ReviewModuleService
