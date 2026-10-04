import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { SUPPORT_TICKET_MODULE } from "../../../modules/support-tickets"
import SupportTicketModuleService from "../../../modules/support-tickets/service"

// GET /store/support-tickets?email=... -> müşterinin kendi taleplerini listeler
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const service: SupportTicketModuleService = req.scope.resolve(
    SUPPORT_TICKET_MODULE
  )
  const email = req.query.email as string | undefined

  if (!email) {
    res.status(400).json({ message: "email parametresi zorunludur." })
    return
  }

  const tickets = await service.listSupportTickets(
    { customer_email: email },
    { order: { created_at: "DESC" } }
  )

  res.json({ support_tickets: tickets })
}

type CreateTicketBody = {
  order_id?: string
  order_display_id?: number
  customer_email: string
  customer_name: string
  subject: string
  message: string
}

// POST /store/support-tickets -> yeni destek talebi (konuşması) başlatır
export async function POST(
  req: MedusaRequest<CreateTicketBody>,
  res: MedusaResponse
): Promise<void> {
  const service: SupportTicketModuleService = req.scope.resolve(
    SUPPORT_TICKET_MODULE
  )
  const {
    order_id,
    order_display_id,
    customer_email,
    customer_name,
    subject,
    message,
  } = req.body

  if (!customer_email || !customer_name || !subject || !message) {
    res.status(400).json({
      message:
        "customer_email, customer_name, subject ve message zorunludur.",
    })
    return
  }

  const ticket = await service.createSupportTickets({
    order_id,
    order_display_id,
    customer_email,
    customer_name,
    subject,
    status: "open",
    messages: [
      {
        sender: "customer",
        message,
        created_at: new Date().toISOString(),
      },
    ] as any,
  } as any)

  res.status(201).json({ support_ticket: ticket })
}
