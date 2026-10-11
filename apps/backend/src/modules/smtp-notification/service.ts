import type { Logger, NotificationTypes } from "@medusajs/framework/types"
import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import nodemailer, { type Transporter } from "nodemailer"

type InjectedDependencies = {
  logger: Logger
}

type SmtpOptions = {
  host: string
  port: number
  user: string
  pass: string
  from: string
  secure?: boolean
}

class SmtpNotificationService extends AbstractNotificationProviderService {
  static identifier = "notification-smtp"

  protected logger_: Logger
  protected transporter_: Transporter
  protected from_: string

  constructor({ logger }: InjectedDependencies, options: SmtpOptions) {
    super()
    this.logger_ = logger
    this.from_ = options.from
    this.transporter_ = nodemailer.createTransport({
      host: options.host,
      port: Number(options.port),
      secure: options.secure ?? Number(options.port) === 465,
      auth: {
        user: options.user,
        pass: options.pass,
      },
    })
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    if (!notification?.to) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "E-posta alıcısı belirtilmedi."
      )
    }

    const subject = notification.content?.subject ?? notification.template ?? "Mağaza bildirimi"
    const html = notification.content?.html ?? this.renderData(notification.data ?? undefined)

    try {
      await this.transporter_.sendMail({
        from: notification.from?.trim() || this.from_,
        to: notification.to,
        subject,
        html,
      })
      return {}
    } catch (error) {
      this.logger_.error(`SMTP e-posta gönderimi başarısız: ${String(error)}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "E-posta gönderilemedi. SMTP ayarlarını kontrol edin."
      )
    }
  }

  private renderData(data?: Record<string, unknown>) {
    if (!data) {
      return ""
    }

    if (typeof data.html === "string") {
      return data.html
    }

    if (typeof data.message === "string") {
      return `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${data.message.replace(/\n/g, "<br />")}</div>`
    }

    return `<pre>${this.escapeHtml(JSON.stringify(data, null, 2))}</pre>`
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }
}

export default SmtpNotificationService
