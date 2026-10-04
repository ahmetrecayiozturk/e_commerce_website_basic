import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    // TS Hatasını önlemek için as any kullanıyoruz
    const customerId = (req as any).auth_context?.actor_id
    if (!customerId) return res.status(401).json({ message: "Oturum açılmadı." })

    const notificationService = req.scope.resolve("customerNotification") as any
    const notifications = await notificationService.listCustomerNotifications(
      { customer_id: customerId },
      { order: { created_at: "DESC" } } 
    )

    res.json({ notifications })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}