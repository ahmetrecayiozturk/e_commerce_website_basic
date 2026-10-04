"use client"

import { Heading, Text, clx } from "@modules/common/components/ui"
import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Review = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const searchParams = useSearchParams()
  const isOpen = searchParams.get("step") === "review"
  const [termsAccepted, setTermsAccepted] = useState(false)

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards && 
    ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])?.length > 0 && 
    cart?.total === 0
  )

  const previousStepsCompleted =
    cart.shipping_address &&
    (cart.shipping_methods?.length ?? 0) > 0 &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          Gözden Geçir
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <div className="flex items-start gap-x-3 w-full mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
            <input
              type="checkbox"
              id="terms-checkbox"
              className="mt-1 w-5 h-5 accent-gray-900 cursor-pointer"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <div className="w-full">
              <label htmlFor="terms-checkbox" className="txt-medium text-ui-fg-base cursor-pointer">
                <LocalizedClientLink href="/content/terms-of-use" className="underline font-semibold hover:text-gray-900" target="_blank">
                  Mesafeli Satış Sözleşmesi
                </LocalizedClientLink>
                'ni ve{" "}
                <LocalizedClientLink href="/content/privacy-policy" className="underline font-semibold hover:text-gray-900" target="_blank">
                  Gizlilik Politikası
                </LocalizedClientLink>
                'nı okudum, anladım ve onaylıyorum.
              </label>
            </div>
          </div>
          
          {/* Checkbox işaretli değilse (termsAccepted = false), disabled={true} gidiyor */}
          <PaymentButton cart={cart} data-testid="submit-order-button" disabled={!termsAccepted} />
        </>
      )}
    </div>
  )
}

export default Review