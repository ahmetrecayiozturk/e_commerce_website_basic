import { Module } from "@medusajs/framework/utils"
import ShipmentTrackingModuleService from "./service"

export const SHIPMENT_TRACKING_MODULE = "shipment_tracking"

export default Module(SHIPMENT_TRACKING_MODULE, {
  service: ShipmentTrackingModuleService,
})
