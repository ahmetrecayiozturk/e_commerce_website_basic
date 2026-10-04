import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi",
  description: "Mesafeli Satış Sözleşmesi ve Kullanım Şartları",
}

export default function TermsOfUsePage() {
  return (
    <div className="py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Mesafeli Satış Sözleşmesi</h1>
      <div className="prose prose-sm text-ui-fg-subtle">
        <h2 className="text-xl font-semibold mt-4 mb-2">MADDE 1 - TARAFLAR</h2>
        <p><strong>1.1. SATICI</strong><br/>
        Unvanı: [Satıcı Firma Unvanı]<br/>
        Adresi: [Satıcı Adresi]<br/>
        Telefon: [Telefon Numarası]<br/>
        E-posta: [E-posta Adresi]</p>

        <h2 className="text-xl font-semibold mt-4 mb-2">MADDE 2 - KONU</h2>
        <p>İşbu sözleşmenin konusu, Alıcı’nın Satıcı’ya ait internet sitesinden elektronik ortamda siparişini verdiği ürün/hizmetin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun hükümleri uyarınca tarafların hak ve yükümlülüklerinin belirlenmesidir.</p>

        <h2 className="text-xl font-semibold mt-4 mb-2">MADDE 3 - CAYMA HAKKI</h2>
        <p>Alıcı; mal satışına ilişkin mesafeli sözleşmelerde, ürünü teslim aldığı günden itibaren 14 (on dört) gün içinde hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin malı reddederek sözleşmeden cayma hakkına sahiptir.</p>
        
        {/* Diğer maddeleri buraya ekleyebilirsin */}
      </div>
    </div>
  )
}