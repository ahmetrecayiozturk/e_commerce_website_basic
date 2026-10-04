"use client"

import { XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import ShippingDetails from "@modules/order/components/shipping-details"
import OrderTracking from "@modules/order/components/order-tracking"
import React from "react"
import OrderReturnRequest from "@modules/order/components/order-return-request"
import OrderCancellationRequest from "@modules/order/components/order-cancellation-request"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
}) => {
  return (
    <div className="flex flex-col justify-center gap-y-4">
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-2xl-semi">Sipariş Detayları</h1>
        <LocalizedClientLink
          href="/account/orders"
          className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base"
          data-testid="back-to-overview-button"
        >
          <XMark /> Geri dön
        </LocalizedClientLink>
      </div>
      <div
        className="flex flex-col gap-4 h-full bg-white w-full"
        data-testid="order-details-container"
      >
        <OrderDetails order={order} showStatus />
        <Items order={order} />
        <ShippingDetails order={order} />
        <OrderTracking orderId={order.id} />
        <OrderCancellationRequest
          orderId={order.id}
          orderDisplayId={order.display_id}
          customerEmail={order.email}
          hasFulfillment={
            (order as any).items?.some(
              (item: any) =>
                Number(item.detail?.fulfilled_quantity ?? 0) > 0
            ) ?? false
          }
        />
        <OrderReturnRequest
          orderId={order.id}
          orderDisplayId={order.display_id}
          customerEmail={order.email}
          fulfillmentStatus={order.fulfillment_status}
        />
        <OrderSummary order={order} />
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
