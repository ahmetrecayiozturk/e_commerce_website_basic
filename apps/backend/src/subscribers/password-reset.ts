import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function passwordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const userEmail = data.entity_id || data.email || data.identifier

  if (!userEmail) {
    console.error("[SMTP] Şifre sıfırlama e-postası için alıcı bulunamadı.")
    return
  }

  const resetLink = `${process.env.STORE_CORS}/reset-password?token=${data.token}&email=${encodeURIComponent(userEmail)}`
  const notificationService = container.resolve(Modules.NOTIFICATION)

  try {
    await notificationService.createNotifications({
      to: userEmail,
      channel: "email",
      template: "password-reset",
      content: {
        subject: "Şifre sıfırlama",
        html: `<p>Şifrenizi yenilemek için aşağıdaki bağlantıyı kullanın:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
      },
    })
    console.log(`[SMTP] ${userEmail} adresine şifre sıfırlama e-postası gönderildi.`)
  } catch (error) {
    console.error("[SMTP] Şifre sıfırlama e-postası gönderilemedi:", error)
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
