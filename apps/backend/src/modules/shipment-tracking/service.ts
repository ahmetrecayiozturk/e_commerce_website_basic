import { MedusaService } from "@medusajs/framework/utils"
import ShipmentTracking from "./models/shipment-tracking"

const CARRIER_URL_TEMPLATES: Record<string, string> = {
  yurtici: "https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code={code}",
  aras: "https://kargotakip.araskargo.com.tr/mainpage.aspx?code={code}",
  mng: "https://www.mngkargo.com.tr/gonderitakip?takipNo={code}",
  ptt: "https://gonderitakip.ptt.gov.tr/Track/Verify?q={code}",
  surat: "https://www.suratkargo.com.tr/KargoTakip?code={code}",
  ups: "https://www.ups.com/track?tracknum={code}",
}

class ShipmentTrackingModuleService extends MedusaService({
  ShipmentTracking,
}) {
  async buildTrackingUrl(
    carrier: string,
    trackingNumber: string
  ): Promise<string | null> {
    const template = CARRIER_URL_TEMPLATES[carrier]
    if (!template) return null
    return template.replace("{code}", encodeURIComponent(trackingNumber))
  }

  async addStatusUpdate(id: string, status: string, note?: string) {
    const tracking: any = await this.retrieveShipmentTracking(id)
    const history = Array.isArray(tracking.status_history)
      ? tracking.status_history
      : []

    history.push({
      status,
      note: note ?? null,
      created_at: new Date().toISOString(),
    })

    return this.updateShipmentTrackings({
      id,
      status: status as any,
      status_history: history as any,
    } as any)
  }
}

export default ShipmentTrackingModuleService