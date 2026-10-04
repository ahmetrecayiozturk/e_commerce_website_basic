import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { SUPPORT_TICKET_MODULE } from "../../../../modules/support-tickets"
import SupportTicketModuleService from "../../../../modules/support-tickets/service"

// GET /admin/support-tickets/:id -> tek bir konuşmanın tüm mesajlarını getirir
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const service: SupportTicketModuleService = req.scope.resolve(
    SUPPORT_TICKET_MODULE
  )
  const { id } = req.params

  const ticket = await service.retrieveSupportTicket(id)

  res.json({ support_ticket: ticket })
}
