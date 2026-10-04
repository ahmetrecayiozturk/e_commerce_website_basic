import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const notificationService = req.scope.resolve("customerNotification") as any
    const customerModule = req.scope.resolve(Modules.CUSTOMER)

    // 1. Geçmiş Bildirimleri Çek
    const notifications = await notificationService.listCustomerNotifications(
      {},
      { order: { created_at: "DESC" }, take: 200 }
    )
    
    const grouped: any[] = [];
    const seen = new Set();
    for (const n of notifications) {
      const key = `${n.subject}-${n.message}`;
      if (!seen.has(key)) {
        seen.add(key);
        grouped.push({ id: n.id, subject: n.subject, message: n.message, created_at: n.created_at });
      }
    }

    // 2. Müşteri Listesini Çek (YENİ - Arayüzdeki dropdown için)
    const customers = await customerModule.listCustomers({}, { take: 200, order: { created_at: "DESC" } })
    const customerList = customers.map((c: any) => ({
      id: c.id,
      email: c.email,
      name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'İsimsiz'
    })).filter((c: any) => c.email) // Sadece maili olanları al

    res.json({ 
      history: grouped.slice(0, 10),
      customers: customerList
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

    let customers: any[] = []
    
    if (email && email.trim() !== "") {
      const foundCustomers = await customerModule.listCustomers({ email: email.trim() })
      if (foundCustomers.length > 0) {
        customers = [foundCustomers[0]]
      }
    } else {
      customers = await customerModule.listCustomers({}, { take: 9999 })
    }

    if (customers.length === 0) {
      return res.status(400).json({ message: "Bu kritere uyan müşteri bulunamadı." })
    }

    if (sendNotification) {
      const notificationsToCreate = customers.map(c => ({
        customer_id: c.id,
        subject,
        message,
        is_read: false
      }))
      await notificationService.createCustomerNotifications(notificationsToCreate)
    }

    if (sendEmail) {
      const emails = customers.map((c: any) => c.email).filter(Boolean)
      const sendgridApiKey = process.env.SENDGRID_API_KEY
      const fromEmail = process.env.SENDGRID_FROM

      if (sendgridApiKey && fromEmail && emails.length > 0) {
        const bccList = emails.map(e => ({ email: e }))

        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${sendgridApiKey}`, 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: fromEmail }],
              bcc: bccList
            }],
            from: { email: fromEmail },
            subject: subject,
            content: [{ 
              type: "text/html", 
              value: `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">${message.replace(/\n/g, '<br/>')}</div>` 
            }]
          })
        })
        if (!response.ok) {
          const errorData = await response.json();
          console.error("SendGrid Hatası:", errorData);
        }
      }
    }

    res.json({ success: true, count: customers.length })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}