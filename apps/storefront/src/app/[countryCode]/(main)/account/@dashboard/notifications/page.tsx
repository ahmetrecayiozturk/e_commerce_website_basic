import { Metadata } from "next"
import { getAuthHeaders } from "@lib/data/cookies"
import { retrieveCustomer } from "@lib/data/customer"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Bildirimlerim",
  description: "Gelen mesajlar.",
}

async function getNotifications() {
  const headers = {
    ...(await getAuthHeaders()),
    "Cache-Control": "no-cache",
    "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
  }
  
  try {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    const res = await fetch(`${backendUrl}/store/notifications`, { headers })
    if (!res.ok) return []
    const data = await res.json()
    return data.notifications || []
  } catch (error) {
    return []
  }
}

export default async function NotificationsPage() {
  const customer = await retrieveCustomer()
  if (!customer) notFound()

  const notifications = await getNotifications()

  return (
    <div className="w-full">
      <h1 className="text-2xl-semi mb-4">Mesajlar ve Bildirimler</h1>
      <div className="flex flex-col gap-y-4">
        {notifications.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">Henüz mesajınız yok.</div>
        ) : (
          notifications.map((note: any) => (
            <div key={note.id} className="bg-white p-5 rounded-lg border shadow-sm">
              <h3 className="font-semibold text-lg">{note.subject}</h3>
              <p className="text-gray-700 text-sm mt-2">{note.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}