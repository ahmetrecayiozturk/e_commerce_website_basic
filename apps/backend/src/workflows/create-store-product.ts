import { MedusaError } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createProductsWorkflow } from "@medusajs/core-flows"
import { STORE_SETTINGS_MODULE } from "../modules/store-settings"

type ProductOptionInput = {
  title: string
  values: string[]
  is_exclusive?: boolean
}

type ProductVariantInput = {
  title?: string
  sku?: string
  options: Record<string, string>
  prices?: Array<{
    amount: number
    currency_code: string
    rules?: { region_id?: string }
  }>
  manage_inventory?: boolean
  allow_backorder?: boolean
  inventory_items?: Array<{
    inventory_item_id: string
    required_quantity: number
  }>
}

type StoreProductInput = {
  tenant_id?: string
  title?: string
  category?: string
  price?: number
  stock_quantity?: number
  subtitle?: string
  description?: string
  handle?: string
  status?: "draft" | "proposed" | "published" | "rejected"
  is_giftcard?: boolean
  discountable?: boolean
  thumbnail?: string
  images?: Array<{ url: string }>
  tags?: Array<{ id?: string; value?: string }> | string[]
  categories?: Array<{ id?: string }> | string[]
  sales_channel_id?: string
  sales_channels?: Array<{ id: string }>
  shipping_profile_id?: string
  options: ProductOptionInput[]
  variants: ProductVariantInput[]
  additional_data?: Record<string, unknown>
}

const normalizeStoreProduct = createStep(
  "normalize-store-product",
  async (input: StoreProductInput, { container }) => {
    const tenantId = input.tenant_id ?? "default"
    const settingsService = container.resolve(STORE_SETTINGS_MODULE) as any
    const settings = await settingsService.getStoreSettingsForTenant(tenantId)
    const title = input.title?.trim() ?? ""

    if (!title) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Ürün adı zorunludur."
      )
    }

    const options = (input.options ?? []).filter(
      (option) => option && option.title && option.title.trim()
    )

    const variants = (input.variants ?? []).filter(
      (variant) => variant && variant.options && Object.keys(variant.options).length > 0
    )

    const simpleOptions = options.length
      ? options
      : [{ title: "Ürün", values: ["Standart"], is_exclusive: true }]
    const simpleVariants = variants.length
      ? variants
      : [
          {
            title,
            options: { Ürün: "Standart" },
            prices: [
              {
                amount: Number(input.price ?? 0),
                currency_code: "TRY",
              },
            ],
          },
        ]

    const salesChannels = [...(input.sales_channels ?? [])]
    const resolvedSalesChannelId =
      input.sales_channel_id ?? settings?.default_sales_channel_id ?? undefined

    if (resolvedSalesChannelId && !salesChannels.some((channel) => channel.id === resolvedSalesChannelId)) {
      salesChannels.push({ id: resolvedSalesChannelId })
    }

    const normalizedVariants = simpleVariants.map((variant) => ({
      ...variant,
      title:
        variant.title?.trim() ||
        Object.values(variant.options || {}).join(" / ") ||
        title,
      manage_inventory: variant.manage_inventory ?? true,
      allow_backorder: variant.allow_backorder ?? false,
      prices:
        variant.prices && variant.prices.length > 0
          ? variant.prices.map((price) => ({ ...price, currency_code: "TRY" }))
          : [
              {
                amount: Number(input.price ?? 0),
                currency_code: "TRY",
              },
            ],
    }))

    const { tenant_id: _tenantId, additional_data: _additionalData, category: _category, price: _price, stock_quantity: _stockQuantity, ...productData } = input

    const payload = {
      ...productData,
      title,
      subtitle: input.subtitle?.trim() || undefined,
      description: input.description?.trim() || undefined,
      handle: input.handle?.trim() || undefined,
      status: input.status ?? "draft",
      is_giftcard: !!input.is_giftcard,
      discountable: input.discountable ?? true,
      thumbnail: input.thumbnail?.trim() || undefined,
      images: input.images?.filter((image) => !!image?.url) ?? undefined,
      sales_channels: salesChannels.length ? salesChannels : undefined,
      shipping_profile_id:
        input.shipping_profile_id ?? settings?.default_shipping_profile_id ?? undefined,
      options: simpleOptions.map((option) => ({
        title: option.title.trim(),
        values: option.values.filter(Boolean).map((value) => value.trim()),
        is_exclusive: option.is_exclusive ?? true,
      })),
      variants: normalizedVariants,
      tags:
        input.tags && input.tags.length
          ? input.tags.map((tag) =>
              typeof tag === "string" ? { value: tag } : { ...tag, value: tag.value ?? tag.id ?? "" }
            )
          : undefined,
      categories:
        input.categories && input.categories.length
          ? input.categories.map((category) =>
              typeof category === "string" ? { id: category } : { id: category.id }
            )
          : undefined,
      metadata: {
        ...(input.additional_data ?? {}),
        category_name: input.category?.trim() || undefined,
        stock_quantity: Number(input.stock_quantity ?? 0),
      },
    }

    return new StepResponse(payload)
  }
)

const createStoreProductWorkflow = createWorkflow(
  "create-store-product",
  (input: StoreProductInput) => {
    const productInput = normalizeStoreProduct(input)

    const workflowInput = transform({ input, productInput }, (data) => ({
      products: [data.productInput],
      additional_data: {
        tenant_id: data.input.tenant_id ?? "default",
        ...(data.input.additional_data ?? {}),
      },
    }))

    const createdProducts = createProductsWorkflow.runAsStep({
      input: workflowInput,
    })

    return new WorkflowResponse({
      product: createdProducts[0],
      products: createdProducts,
    })
  }
)

export default createStoreProductWorkflow
