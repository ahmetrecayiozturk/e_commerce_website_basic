"use client"

import { useEffect, useState } from "react"

type Message = {
  sender: "customer" | "admin"
  message: string
  created_at: string
}

type Ticket = {
  id: string
  order_display_id?: number | null
  subject: string
  status: "open" | "closed"
  messages: Message[]
  created_at: string
}

export default function SupportTickets({
  customerEmail,
  customerName,
}: {
  customerEmail: string
  customerName: string
}) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [showNewForm, setShowNewForm] = useState(false)
  const [newForm, setNewForm] = useState({ subject: "", message: "" })

  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!

  const fetchTickets = async () => {
    setLoading(true)
    const res = await fetch(
      `${backendUrl}/store/support-tickets?email=${encodeURIComponent(
        customerEmail
      )}`,
      { headers: { "x-publishable-api-key": publishableKey } }
    )
    const data = await res.json()
    setTickets(data.support_tickets ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchTickets()
  }, [customerEmail])

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch(`${backendUrl}/store/support-tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": publishableKey,
      },
      body: JSON.stringify({
        customer_email: customerEmail,
        customer_name: customerName,
        subject: newForm.subject,
        message: newForm.message,
      }),
    })
    setNewForm({ subject: "", message: "" })
    setShowNewForm(false)
    fetchTickets()
  }

  const sendReply = async (id: string) => {
    const message = replyDrafts[id]
    if (!message?.trim()) return

    await fetch(`${backendUrl}/store/support-tickets/${id}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": publishableKey,
      },
      body: JSON.stringify({ message }),
    })
    setReplyDrafts({ ...replyDrafts, [id]: "" })
    fetchTickets()
  }

  if (loading) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl-semi">Destek</h1>
        {!showNewForm && (
          <button
            onClick={() => setShowNewForm(true)}
            className="text-ui-fg-interactive underline text-sm"
          >
            Yeni talep oluştur
          </button>
        )}
      </div>

      {showNewForm && (
        <form
          onSubmit={createTicket}
          className="flex flex-col gap-3 border rounded-lg p-4 max-w-lg"
        >
          <input
            required
            placeholder="Konu"
            className="border rounded p-2"
            value={newForm.subject}
            onChange={(e) =>
              setNewForm({ ...newForm, subject: e.target.value })
            }
          />
          <textarea
            required
            placeholder="Mesajınız"
            className="border rounded p-2"
            rows={4}
            value={newForm.message}
            onChange={(e) =>
              setNewForm({ ...newForm, message: e.target.value })
            }
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-black text-white rounded p-2 px-4 hover:opacity-90"
            >
              Gönder
            </button>
            <button
              type="button"
              onClick={() => setShowNewForm(false)}
              className="text-sm text-gray-500"
            >
              Vazgeç
            </button>
          </div>
        </form>
      )}

      {tickets.length === 0 && !showNewForm && (
        <p className="text-sm text-gray-500">
          Henüz bir destek talebiniz yok.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {tickets.map((t) => {
          const isOpen = expandedId === t.id
          return (
            <div key={t.id} className="border rounded-lg overflow-hidden">
              <button
                className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50"
                onClick={() => setExpandedId(isOpen ? null : t.id)}
              >
                <div>
                  <span className="font-medium">{t.subject}</span>
                  {t.order_display_id && (
                    <span className="text-sm text-gray-500">
                      {" "}
                      — Sipariş #{t.order_display_id}
                    </span>
                  )}
                </div>
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {t.status === "open" ? "Açık" : "Kapalı"}
                </span>
              </button>

              {isOpen && (
                <div className="border-t p-4 flex flex-col gap-3 bg-gray-50">
                  <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                    {t.messages?.map((m, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg max-w-[80%] text-sm ${
                          m.sender === "customer"
                            ? "bg-black text-white self-end"
                            : "bg-white border self-start"
                        }`}
                      >
                        <div
                          className={`text-xs mb-1 ${
                            m.sender === "customer"
                              ? "text-white/70"
                              : "text-gray-500"
                          }`}
                        >
                          {m.sender === "customer" ? "Siz" : "Destek Ekibi"} —{" "}
                          {new Date(m.created_at).toLocaleString("tr-TR")}
                        </div>
                        {m.message}
                      </div>
                    ))}
                  </div>

                  {t.status === "open" ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        placeholder="Cevabınızı yazın..."
                        className="border rounded p-2"
                        rows={3}
                        value={replyDrafts[t.id] ?? ""}
                        onChange={(e) =>
                          setReplyDrafts({
                            ...replyDrafts,
                            [t.id]: e.target.value,
                          })
                        }
                      />
                      <button
                        onClick={() => sendReply(t.id)}
                        className="bg-black text-white rounded p-2 px-4 self-start hover:opacity-90"
                      >
                        Gönder
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Bu talep kapatıldı.
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
