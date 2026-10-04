import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import {
  Container,
  Heading,
  Badge,
  Button,
  Text,
  Textarea,
  Select,
} from "@medusajs/ui"
import { useEffect, useState } from "react"

type Message = {
  sender: "customer" | "admin"
  message: string
  created_at: string
}

type Ticket = {
  id: string
  order_id?: string | null
  order_display_id?: number | null
  customer_email: string
  customer_name: string
  subject: string
  status: "open" | "closed"
  messages: Message[]
  created_at: string
}

const SupportPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("open")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})

  const fetchTickets = async () => {
    setLoading(true)
    const query = statusFilter === "all" ? "" : `?status=${statusFilter}`
    const res = await fetch(`/admin/support-tickets${query}`, {
      credentials: "include",
    })
    const json = await res.json()
    setTickets(json.support_tickets ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchTickets()
  }, [statusFilter])

  const sendReply = async (id: string) => {
    const message = replyDrafts[id]
    if (!message?.trim()) return

    await fetch(`/admin/support-tickets/${id}/messages`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })
    setReplyDrafts({ ...replyDrafts, [id]: "" })
    fetchTickets()
  }

  const toggleStatus = async (id: string, current: string) => {
    const next = current === "open" ? "closed" : "open"
    await fetch(`/admin/support-tickets/${id}/close`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    })
    fetchTickets()
  }

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">Destek Talepleri</Heading>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <Select.Trigger className="w-48">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="open">Açık</Select.Item>
            <Select.Item value="closed">Kapalı</Select.Item>
            <Select.Item value="all">Tümü</Select.Item>
          </Select.Content>
        </Select>
      </div>

      {loading && <Text>Yükleniyor...</Text>}
      {!loading && tickets.length === 0 && (
        <Text className="text-ui-fg-subtle">Bu filtrede talep yok.</Text>
      )}

      <div className="flex flex-col gap-3">
        {tickets.map((t) => {
          const isOpen = expandedId === t.id
          return (
            <div key={t.id} className="border rounded-lg overflow-hidden">
              <button
                className="w-full text-left p-4 flex items-center justify-between hover:bg-ui-bg-subtle"
                onClick={() => setExpandedId(isOpen ? null : t.id)}
              >
                <div>
                  <Text weight="plus">{t.subject}</Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    {t.customer_name} — {t.customer_email}
                    {t.order_display_id
                      ? ` — Sipariş #${t.order_display_id}`
                      : ""}
                  </Text>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={t.status === "open" ? "green" : "grey"}>
                    {t.status === "open" ? "Açık" : "Kapalı"}
                  </Badge>
                  <Text size="small" className="text-ui-fg-muted">
                    {t.messages?.length ?? 0} mesaj
                  </Text>
                </div>
              </button>

              {isOpen && (
                <div className="border-t p-4 flex flex-col gap-3 bg-ui-bg-subtle">
                  <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                    {t.messages?.map((m, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg max-w-[80%] ${
                          m.sender === "admin"
                            ? "bg-ui-bg-interactive text-white self-end"
                            : "bg-white self-start border"
                        }`}
                      >
                        <Text
                          size="xsmall"
                          className={
                            m.sender === "admin"
                              ? "text-white/70"
                              : "text-ui-fg-subtle"
                          }
                        >
                          {m.sender === "admin" ? "Siz" : t.customer_name} —{" "}
                          {new Date(m.created_at).toLocaleString("tr-TR")}
                        </Text>
                        <Text>{m.message}</Text>
                      </div>
                    ))}
                  </div>

                  <Textarea
                    placeholder="Cevabınızı yazın..."
                    value={replyDrafts[t.id] ?? ""}
                    onChange={(e) =>
                      setReplyDrafts({
                        ...replyDrafts,
                        [t.id]: e.target.value,
                      })
                    }
                  />
                  <div className="flex gap-2">
                    <Button size="small" onClick={() => sendReply(t.id)}>
                      Gönder
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => toggleStatus(t.id, t.status)}
                    >
                      {t.status === "open"
                        ? "Talebi Kapat"
                        : "Talebi Tekrar Aç"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Support",
  icon: ChatBubbleLeftRight,
})

export default SupportPage
