import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"
import { Container, Heading, Text, Button } from "@medusajs/ui"
import { useEffect, useState } from "react"

const IyzicoPaymentInfoWidget = ({ data: order }: DetailWidgetProps<AdminOrder>) => {
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `/admin/orders/${order.id}?fields=*payment_collections.payments`,
          { credentials: "include" }
        )
        const json = await res.json()

        const payments =
          json.order?.payment_collections?.flatMap(
            (pc: any) => pc.payments ?? []
          ) ?? []

        const iyzicoPayment = payments.find(
          (p: any) => p.provider_id === "pp_iyzico_iyzico"
        )

        if (iyzicoPayment?.data) {
          setPaymentId(iyzicoPayment.data.paymentId ?? null)
          setConversationId(iyzicoPayment.data.conversationId ?? null)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [order.id])

  if (loading || (!paymentId && !conversationId)) {
    return null
  }

  return (
    <Container className="p-6">
      <Heading level="h2" className="mb-4">
        iyzico Islem Bilgisi
      </Heading>
      <div className="flex flex-col gap-2">
        {paymentId && (
          <div className="flex items-center justify-between">
            <Text size="small" className="text-ui-fg-subtle">
              Payment ID
            </Text>
            <div className="flex items-center gap-2">
              <Text size="small" className="font-mono">
                {paymentId}
              </Text>
              <Button
                size="small"
                variant="transparent"
                onClick={() => navigator.clipboard.writeText(paymentId)}
              >
                Kopyala
              </Button>
            </div>
          </div>
        )}
        {conversationId && (
          <div className="flex items-center justify-between">
            <Text size="small" className="text-ui-fg-subtle">
              Conversation ID
            </Text>
            <div className="flex items-center gap-2">
              <Text size="small" className="font-mono">
                {conversationId}
              </Text>
              <Button
                size="small"
                variant="transparent"
                onClick={() => navigator.clipboard.writeText(conversationId)}
              >
                Kopyala
              </Button>
            </div>
          </div>
        )}
        <Text size="xsmall" className="text-ui-fg-muted mt-2">
          Bu kimlikleri iyzico Merchant Panel {'>'} Islemler bolumunde arayarak
          bu siparisin iyzico tarafindaki karsiligini bulabilirsiniz.
        </Text>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default IyzicoPaymentInfoWidget