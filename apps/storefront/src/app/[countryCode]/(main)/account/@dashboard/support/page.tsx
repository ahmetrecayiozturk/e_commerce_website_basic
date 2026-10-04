// Örnek dosya konumu:
// src/app/[countryCode]/(main)/account/@dashboard/support/page.tsx
//
// account/@dashboard/orders/page.tsx dosyasının yanına, aynı yapıda eklenir.

import { retrieveCustomer } from "@lib/data/customer"
import SupportTickets from "@modules/account/components/support-tickets"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Destek",
  description: "Destek talepleriniz",
}

export default async function SupportPage() {
  const customer = await retrieveCustomer()

  if (!customer) {
    return notFound()
  }

  return (
    <SupportTickets
      customerEmail={customer.email}
      customerName={`${customer.first_name ?? ""} ${
        customer.last_name ?? ""
      }`.trim()}
    />
  )
}
