import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "Gizlilik Politikası ve KVKK Aydınlatma Metni",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Gizlilik Politikası ve KVKK</h1>
      <div className="prose prose-sm text-ui-fg-subtle">
        <p>Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, veri sorumlusu sıfatıyla şirketimiz tarafından işlenmektedir.</p>
        <h2 className="text-xl font-semibold mt-4 mb-2">1. Kişisel Verilerin İşlenme Amacı</h2>
        <p>Toplanan kişisel verileriniz, siparişlerinizin işlenmesi, teslimatların gerçekleştirilmesi ve yasal yükümlülüklerimizin yerine getirilmesi amacıyla işlenmektedir.</p>
        {/* Kendi KVKK metnini buraya ekleyebilirsin */}
      </div>
    </div>
  )
}