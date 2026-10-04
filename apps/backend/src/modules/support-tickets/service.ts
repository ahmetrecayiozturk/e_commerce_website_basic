import { MedusaService } from "@medusajs/framework/utils"
import SupportTicket from "./models/support-ticket"

class SupportTicketModuleService extends MedusaService({
  SupportTicket,
}) {
  async addMessage(
    id: string,
    sender: "customer" | "admin",
    message: string
  ) {
    const ticket: any = await this.retrieveSupportTicket(id)
    const messages = Array.isArray(ticket.messages) ? ticket.messages : []

    messages.push({
      sender,
      message,
      created_at: new Date().toISOString(),
    })

    return this.updateSupportTickets({
      id,
      messages: messages as any,
      // Müşteri yazınca talep otomatik "open" kalsın/olsun;
      // admin yazınca durumu değiştirmiyoruz burada, ayrı endpoint var.
      status: sender === "customer" ? "open" : (ticket.status as any),
    } as any)
  }
}

export default SupportTicketModuleService
