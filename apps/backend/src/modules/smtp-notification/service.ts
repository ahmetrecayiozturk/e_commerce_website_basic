import type { Logger, NotificationTypes } from "@medusajs/framework/types"
import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import nodemailer, { type Transporter } from "nodemailer"
import { STORE_SETTINGS_MODULE } from "../store-settings"

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
  protected settingsService_: any

  constructor(container: InjectedDependencies & Record<string, any>, options: SmtpOptions) {
    super()
    this.logger_ = container.logger
    this.settingsService_ =
      container.resolve?.(STORE_SETTINGS_MODULE) ?? container[STORE_SETTINGS_MODULE]
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

  private async getTransport() {
    if (!this.settingsService_) return this.transporter_
    const settings = await this.settingsService_.getIntegrationConfig()
    this.from_ = settings.smtpFrom || this.from_
    return nodemailer.createTransport({
      host: settings.smtpHost,
      port: Number(settings.smtpPort),
      secure: settings.smtpSecure,
      auth: { user: settings.smtpUser, pass: settings.smtpPass },
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
      const transporter = await this.getTransport()
      await transporter.sendMail({
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
