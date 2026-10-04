import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const body = req.body as { token?: string }
  const token = body?.token
  const storefrontUrl = process.env.STOREFRONT_URL
  const countryCode = (
    process.env.STOREFRONT_COUNTRY_CODE || "tr"
  ).toLowerCase()

  if (!storefrontUrl) {
    res.status(500).json({ message: "STOREFRONT_URL is not configured" })
    return
  }

  let redirectUrl: URL
  try {
    redirectUrl = new URL(storefrontUrl)
  } catch {
    res.status(500).json({ message: "STOREFRONT_URL is invalid" })
    return
  }

  if (!token) {
    redirectUrl.pathname = `/${countryCode}/checkout`
    redirectUrl.search = "?error=missing_token"
    res.redirect(redirectUrl.toString())
    return
  }

  redirectUrl.pathname = `/${countryCode}/checkout/iyzico-result`
  redirectUrl.search = new URLSearchParams({ token }).toString()
  res.redirect(redirectUrl.toString())
}
