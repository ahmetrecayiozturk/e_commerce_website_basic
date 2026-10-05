import {
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createLocationFulfillmentSetWorkflow,
  createServiceZonesWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
} from "@medusajs/core-flows"
import { Modules } from "@medusajs/framework/utils"
import type { ExecArgs } from "@medusajs/framework/types"
import { STORE_SETTINGS_MODULE } from "../modules/store-settings"

const findByName = (items: any[], name: string) =>
  items.find((item) => item.name?.toLocaleLowerCase("tr-TR") === name.toLocaleLowerCase("tr-TR"))

export default async function initialDataSeed({ container }: ExecArgs) {
  const regionService = container.resolve(Modules.REGION) as any
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL) as any
  const stockLocationService = container.resolve(Modules.STOCK_LOCATION) as any
  const fulfillmentService = container.resolve(Modules.FULFILLMENT) as any

  const regions = await regionService.listRegions({}, { take: 100 })
  const region =
    regions.find((item: any) => item.currency_code === "try") ??
    (
      await createRegionsWorkflow(container).run({
        input: {
          regions: [
            {
              name: "Türkiye",
              currency_code: "try",
              countries: ["tr"],
            },
          ],
        },
      })
    ).result[0]

  const salesChannels = await salesChannelService.listSalesChannels({}, { take: 100 })
  const salesChannel =
    findByName(salesChannels, "Türkiye Mağazası") ??
    (
      await createSalesChannelsWorkflow(container).run({
        input: {
          salesChannelsData: [{ name: "Türkiye Mağazası", description: "Varsayılan web mağazası" }],
        },
      })
    ).result[0]

  const stockLocations = await stockLocationService.listStockLocations({}, { take: 100 })
  const stockLocation =
    findByName(stockLocations, "Türkiye Deposu") ??
    (
      await createStockLocationsWorkflow(container).run({
        input: {
          locations: [{ name: "Türkiye Deposu" }],
        },
      })
    ).result[0]

  const shippingProfiles = await fulfillmentService.listShippingProfiles({}, { take: 100 })
  const shippingProfile =
    findByName(shippingProfiles, "Standart Ürünler") ??
    (
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [{ name: "Standart Ürünler", type: "standard" }],
        },
      })
    ).result[0]

  const fulfillmentSets = await fulfillmentService.listFulfillmentSets({}, { take: 100 })
  const fulfillmentSet =
    fulfillmentSets.find((item: any) => item.location_id === stockLocation.id) ??
    (
      await createLocationFulfillmentSetWorkflow(container).run({
        input: {
          location_id: stockLocation.id,
          fulfillment_set_data: {
            name: "Türkiye Kargo",
            type: "shipping",
          },
        },
      })
    ).result

  const serviceZones = await fulfillmentService.listServiceZones({}, { take: 100 })
  const serviceZone =
    serviceZones.find((item: any) => item.fulfillment_set_id === fulfillmentSet.id) ??
    (
      await createServiceZonesWorkflow(container).run({
        input: {
          data: [
            {
              name: "Türkiye",
              fulfillment_set_id: fulfillmentSet.id,
              geo_zones: [{ type: "country", country_code: "tr" }],
            },
          ],
        },
      })
    ).result[0]

  const fulfillmentProviders = await fulfillmentService.listFulfillmentProviders(
    {},
    { take: 100 }
  )
  const fulfillmentProvider =
    fulfillmentProviders.find((provider: any) => provider.id?.includes("manual")) ??
    fulfillmentProviders[0]
  const shippingOptions = await fulfillmentService.listShippingOptions({}, { take: 100 })
  const shippingOption =
    shippingOptions.find(
      (item: any) =>
        item.name === "Türkiye Standart Kargo" &&
        item.service_zone_id === serviceZone.id
    ) ??
    (
      await createShippingOptionsWorkflow(container).run({
        input: [
          {
            name: "Türkiye Standart Kargo",
            service_zone_id: serviceZone.id,
            shipping_profile_id: shippingProfile.id,
            provider_id: fulfillmentProvider?.id ?? "manual",
            type: {
              label: "Standart",
              description: "Türkiye içi standart teslimat",
              code: "standard",
            },
            price_type: "flat",
            prices: [{ amount: 0, currency_code: "try" }],
          },
        ],
      })
    ).result[0]

  const paymentProviders = await (
    container.resolve(Modules.PAYMENT) as any
  ).listPaymentProviders({}, { take: 100 })
  const iyzicoProvider = paymentProviders.find((provider: any) =>
    provider.id?.toLowerCase().includes("iyzico")
  )

  const settingsService = container.resolve(STORE_SETTINGS_MODULE) as any
  await settingsService.saveStoreSettings("default", {
    country_code: "TR",
    default_region_id: region.id,
    default_currency_code: "TRY",
    default_sales_channel_id: salesChannel.id,
    default_shipping_profile_id: shippingProfile.id,
    default_shipping_option_id: shippingOption.id,
    default_stock_location_id: stockLocation.id,
    default_payment_provider_id: iyzicoProvider?.id ?? "",
  })
}
