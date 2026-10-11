import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const notificationService = req.scope.resolve("customerNotification") as any
    const customerModule = req.scope.resolve(Modules.CUSTOMER)
    const notifications = await notificationService.listCustomerNotifications(
      {},
      { order: { created_at: "DESC" }, take: 200 }
    )
    const grouped: any[] = []
    const seen = new Set<string>()

    for (const notification of notifications) {
      const key = `${notification.subject}-${notification.message}`
      if (!seen.has(key)) {
        seen.add(key)
        grouped.push({
          id: notification.id,
          subject: notification.subject,
          message: notification.message,
          created_at: notification.created_at,
        })
      }
    }

    const customers = await customerModule.listCustomers(
      {},
      { take: 200, order: { created_at: "DESC" } }
    )
    const customerList = customers
      .map((customer: any) => ({
        id: customer.id,
        email: customer.email,
        name:
          `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
          "İsimsiz",
      }))
      .filter((customer: any) => customer.email)

    res.json({
      history: grouped.slice(0, 10),
      customers: customerList,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { subject, message, email, sendEmail, sendNotification } = req.body as any
    const customerModule = req.scope.resolve(Modules.CUSTOMER)
    const notificationService = req.scope.resolve("customerNotification") as any

    const customers =
      email && email.trim() !== ""
        ? await customerModule.listCustomers({ email: email.trim() })
        : await customerModule.listCustomers({}, { take: 9999 })

    if (!customers.length) {
      return res.status(400).json({ message: "Bu kritere uyan müşteri bulunamadı." })
    }

    if (sendNotification) {
      await notificationService.createCustomerNotifications(
        customers.map((customer: any) => ({
          customer_id: customer.id,
          subject,
          message,
          is_read: false,
        }))
      )
    }

    if (sendEmail) {
      const emailService = req.scope.resolve(Modules.NOTIFICATION)
      for (const customer of customers) {
        if (!customer.email) continue
        await emailService.createNotifications({
          to: customer.email,
          channel: "email",
          template: "broadcast",
          content: {
            subject,
            html: `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">${String(message).replace(/\n/g, "<br />")}</div>`,
          },
        })
      }
    }

    res.json({ success: true, count: customers.length })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
