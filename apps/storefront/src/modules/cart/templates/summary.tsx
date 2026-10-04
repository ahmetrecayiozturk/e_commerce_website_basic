"use client"

import { Button, Heading } from "@modules/common/components/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart
  customer?: HttpTypes.StoreCustomer | null
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart, customer }: SummaryProps) => {
  const step = getCheckoutStep(cart)
  const isLoggedIn = !!customer

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Sipariş Özeti
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      <LocalizedClientLink
        href={isLoggedIn ? "/checkout?step=" + step : "/account"}
        data-testid="checkout-button"
      >
        <Button className="w-full h-10">
          {isLoggedIn ? "Siparişe git" : "Giriş yaparak siparişe devam et"}
        </Button>
      </LocalizedClientLink>
      {!isLoggedIn && (
        <p className="text-small-regular text-ui-fg-subtle text-center">
          Sipariş verebilmek için giriş yapmanız ya da hesap oluşturmanız
          gerekir.
        </p>
      )}
    </div>
  )
}

export default Summary