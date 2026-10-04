import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

// Tip tanımlamasını "any" yaparak Medusa'nın tüm verilerini özgürce okuyoruz
export default async function passwordResetHandler({
  event: { data },
}: SubscriberArgs<any>) {
  
  // DÜZELTME BURADA: Medusa v2 emailpass modülü, e-posta adresini "entity_id" içinde gönderir!
  const userEmail = data.entity_id || data.email || data.identifier;

  if (!userEmail) {
    console.error("[SendGrid] E-posta adresi bulunamadı! Medusa'nın gönderdiği ham veri:", JSON.stringify(data));
    return;
  }

  console.log(`[SendGrid] ${userEmail} adresine şifre sıfırlama linki gönderiliyor...`);

  // E-postadaki butona tıklandığında gidilecek adres
const resetLink = `${process.env.STORE_CORS}/reset-password?token=${data.token}&email=${userEmail}`;

  // GELİŞTİRİCİ HACK'İ: Mail gitmese bile linki terminalden alıp test edebilmek için
  console.log("\n=======================================================");
  console.log("🔑 ŞİFRE SIFIRLAMA LİNKİ (BURADAN KOPYALA):");
  console.log(resetLink);
  console.log("=======================================================\n");
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: userEmail }],
            dynamic_template_data: {
              reset_link: resetLink,
              order_id: "Şifre Sıfırlama" // Şablonun hata vermemesi için
            }
          }
        ],
        from: { email: process.env.SENDGRID_FROM_EMAIL || process.env.SENDGRID_FROM },
        template_id: process.env.SENDGRID_FORGOT_PASSWORD_TPL
      })
    });

    if (response.ok) {
      console.log("✅ [SendGrid] E-posta BAŞARIYLA gönderildi!");
    } else {
      const err = await response.text();
      console.error("❌ [SendGrid] Gönderim hatası:", err);
    }
  } catch (err) {
    console.error("❌ [SendGrid] API'ye bağlanırken hata oluştu:", err);
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset", 
}