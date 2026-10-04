// Storefront'un sipariş önbelleğini temizlemek için çağrılır.
// Hata olursa (storefront kapalıysa vb.) sessizce loglar, admin işlemini bozmaz.
export async function revalidateStorefrontOrders() {
  const storefrontUrl = process.env.STOREFRONT_URL
  const secret = process.env.REVALIDATE_SECRET

  if (!storefrontUrl || !secret) {
    return
  }

  try {
    await fetch(
      `${storefrontUrl}/api/revalidate?secret=${secret}&tag=orders`,
      { method: "POST" }
    )
  } catch (err) {
    console.log("Storefront revalidate çağrısı başarısız oldu:", err)
  }
}