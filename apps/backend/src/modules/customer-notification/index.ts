import { Module } from "@medusajs/framework/utils"
import { MedusaService } from "@medusajs/framework/utils"
import { CustomerNotification } from "./models/notification"

class CustomerNotificationService extends MedusaService({
  CustomerNotification,
}) {}

export const CUSTOMER_NOTIFICATION_MODULE = "customerNotification"

export default Module(CUSTOMER_NOTIFICATION_MODULE, {
  service: CustomerNotificationService,
})