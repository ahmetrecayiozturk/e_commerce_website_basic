// @ts-nocheck
import { useState, useEffect } from "react"
import { Container, Heading, Input, Textarea, Button, Text, Table } from "@medusajs/ui"
import { EnvelopeSolid } from "@medusajs/icons"
import { defineRouteConfig } from "@medusajs/admin-sdk"

const BroadcastPage = () => {
  const [targetType, setTargetType] = useState("all")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState("")
  
  const [sendEmail, setSendEmail] = useState(true)
  const [sendNotification, setSendNotification] = useState(true)

  const [history, setHistory] = useState([])
  const [customerList, setCustomerList] = useState([]) // YENİ: Müşteri listesi

  const fetchData = async () => {
    try {
      const res = await fetch("/admin/broadcast")
      const data = await res.json()
      if (data.history) setHistory(data.history)
      if (data.customers) setCustomerList(data.customers) // Müşterileri kaydet
    } catch (err) {}
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSend = async () => {
    if (!subject || !message) return alert("Lütfen konu ve mesajı doldurun.")
    if (targetType === "single" && !email) return alert("Müşteri E-posta adresi gerekli.")
    if (!sendEmail && !sendNotification) return alert("Lütfen en az bir gönderim yöntemi seçin.")
    
    if (!window.confirm("Mesajı göndermek istediğinize emin misiniz?")) return;

    setStatus("🚀 Gönderiliyor...")
    try {
      const res = await fetch("/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          subject, 
          message,
          email: targetType === "single" ? email : null,
          sendEmail,
          sendNotification
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus(`✅ Başarılı! İşlem ${data.count} müşteri için tamamlandı.`)
        setSubject(""); setMessage(""); setEmail("");
        fetchData();
      } else {
        setStatus(`❌ Hata: ${data.message || "Gönderilemedi."}`)
      }
    } catch (err) {
      setStatus("❌ Sunucu hatası oluştu.")
    }
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="p-8">
        <Heading level="h1" className="mb-4">Mesaj ve Mail Merkezi</Heading>
        <Text className="text-ui-fg-subtle mb-8">
          Müşterilerinize ulaşmak istediğiniz yöntemi seçin ve duyurularınızı yapın.
        </Text>
        
        <div className="flex flex-col gap-6 max-w-2xl">
          <div>
            <Text className="mb-2 font-medium">1. Hedef Kitle</Text>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={targetType === "all"} onChange={() => setTargetType("all")} /> Tüm Müşterilere (Toplu)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={targetType === "single"} onChange={() => setTargetType("single")} /> Tek Müşteriye
              </label>
            </div>
            {targetType === "single" && (
              <div className="mt-2 flex flex-col gap-3">
                 <select 
                  className="p-2 rounded-md border border-ui-border-base bg-ui-bg-field text-ui-fg-base text-sm w-full focus:outline-none focus:shadow-borders-focus"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                >
                  <option value="" className="bg-ui-bg-base text-ui-fg-subtle">
                    -- Müşteri Seçin (Kayıtlı Tüm Müşteriler) --
                  </option>
                  {customerList.map((c: any) => (
                    <option key={c.id} value={c.email} className="bg-ui-bg-base text-ui-fg-base">
                      {c.name} - {c.email}
                    </option>
                  ))}
                </select>
                <Text className="text-ui-fg-subtle text-xs">- VEYA -</Text>
                <Input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Manuel olarak e-posta adresi yazın..." 
                />
              </div>
            )}
          </div>

          <div>
            <Text className="mb-2 font-medium">2. Gönderim Yöntemi</Text>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} /> 
                E-Posta Olarak Gönder (SendGrid)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={sendNotification} onChange={(e) => setSendNotification(e.target.checked)} /> 
                Uygulama İçi Bildirim Gönder
              </label>
            </div>
          </div>

          <div className="mt-4">
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Konu / Başlık" className="mb-4" />
            <Textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Mesaj İçeriği..." />
          </div>
          
          {status && <Text className="font-medium text-lg">{status}</Text>}
          <Button variant="primary" onClick={handleSend} className="w-fit">Gönder</Button>
        </div>
      </Container>

      <Container className="p-8">
        <Heading level="h2" className="mb-4">Son Gönderilen Mesajlar</Heading>
        {history.length === 0 ? (
          <Text className="text-ui-fg-subtle">Henüz hiçbir mesaj gönderilmedi.</Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Tarih</Table.HeaderCell>
                <Table.HeaderCell>Konu / Başlık</Table.HeaderCell>
                <Table.HeaderCell>İçerik (Özet)</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {history.map((item: any) => (
                <Table.Row key={item.id}>
                  <Table.Cell className="text-ui-fg-subtle whitespace-nowrap">
                    {new Date(item.created_at).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </Table.Cell>
                  <Table.Cell className="font-medium">{item.subject}</Table.Cell>
                  <Table.Cell>
                    <div className="truncate max-w-md">{item.message}</div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Message Center",
  icon: EnvelopeSolid,
})

export default BroadcastPage