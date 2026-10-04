import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

// Backend'den (subscriber ya da admin route'lardan) çağrılır.
// Sipariş verisi değiştiğinde storefront'un önbelleğini temizler.
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Geçersiz secret" }, { status: 401 })
  }

  const tag = req.nextUrl.searchParams.get("tag") || "orders"
  revalidateTag(tag)

  return NextResponse.json({ revalidated: true, tag, now: Date.now() })
}