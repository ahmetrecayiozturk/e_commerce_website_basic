import { Container, Heading, Text } from "@modules/common/components/ui"
import { isStripeLike, paymentInfoMap } from "@lib/constants"
import Divider from "@modules/common/components/divider"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0].payments?.[0]
  const paymentData = (payment?.data as any) || {}

  // İyzico'dan gelen gerçek çekilen tutar (vade farkı dahil) veya standart tutar
  const finalAmount = paymentData.paidPrice ? Number(paymentData.paidPrice) : payment?.amount
  
  // Taksit bilgisi (1 ise Tek Çekim, 3 ise 3 Taksit vb.)
  const installmentCount = paymentData.installment ? Number(paymentData.installment) : 1
  const installmentText = installmentCount > 1 ? `${installmentCount} Taksit` : "Tek Çekim"

  return (
    <div>
      <Heading level="h2" className="flex flex-row text-3xl-regular my-6">
        Ödeme
      </Heading>
      <div>
        {payment && (
          <div className="flex items-start gap-x-1 w-full">
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Ödeme Yöntemi
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method"
              >
                {paymentInfoMap[payment.provider_id]?.title || "iyzico"} ({installmentText})
              </Text>
            </div>
            <div className="flex flex-col w-2/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Ödeme Detayları
              </Text>
              <div className="flex gap-2 txt-medium text-ui-fg-subtle items-center">
                <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                  {paymentInfoMap[payment.provider_id]?.icon}
                </Container>
                <Text data-testid="payment-amount">
                  {isStripeLike(payment.provider_id) && payment.data?.card_last4
                    ? `**** **** **** ${payment.data.card_last4}`
                    : `${convertToLocale({
                        amount: finalAmount ?? 0,
                        currency_code: order.currency_code,
                      })} ödendi. Tarih: ${new Date(
                        payment.created_at ?? ""
                      ).toLocaleString("tr-TR")}`}
                </Text>
              </div>
            </div>
          </div>
        )}
      </div>

      <Divider className="mt-8" />
    </div>
  )
}

export default PaymentDetails