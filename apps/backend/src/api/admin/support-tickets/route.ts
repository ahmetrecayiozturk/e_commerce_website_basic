import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { SUPPORT_TICKET_MODULE } from "../../../modules/support-tickets"
import SupportTicketModuleService from "../../../modules/support-tickets/service"

// GET /admin/support-tickets?status=open -> tüm destek taleplerini listeler
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const service: SupportTicketModuleService = req.scope.resolve(
    SUPPORT_TICKET_MODULE
  )
  const status = req.query.status as string | undefined

  const filters = status ? { status } : {}

  const tickets = await service.listSupportTickets(filters, {
    order: { created_at: "DESC" },
  })

  res.json({ support_tickets: tickets, count: tickets.length })
}
