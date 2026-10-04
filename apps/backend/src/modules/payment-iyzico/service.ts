import {
  AbstractPaymentProvider,
  MedusaError,
} from "@medusajs/framework/utils"
import { IyzicoOptions } from "./types"

const Iyzipay = require("iyzipay")

// --- TCKN DOĞRULAMA ALGORİTMASI ---
function isValidTCKN(tc: string): boolean {
  if (!tc || !/^[1-9][0-9]{10}$/.test(tc)) return false;

  const digits = tc.split('').map(Number);
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

  const tenthDigit = (oddSum * 7 - evenSum) % 10;
  if (tenthDigit !== digits[9]) return false;

  const totalSum = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  if (totalSum % 10 !== digits[10]) return false;

  return true;
}

class IyzicoPaymentProviderService extends AbstractPaymentProvider<IyzicoOptions> {
  static identifier = "iyzico"

  protected client_: any
  protected options_: IyzicoOptions

  constructor(container: any, options: IyzicoOptions) {
    super(container, options)
    this.options_ = options

    this.client_ = new Iyzipay({
      apiKey: options.api_key,
      secretKey: options.secret_key,
      uri: this.normalizeBaseUrl(options.base_url),
    })
  }

  async initiatePayment(input: any): Promise<any> {
    const { amount, currency_code, context } = input
    const customer = context?.customer

    const conversationId = `cart_${context?.resource_id ?? Date.now()}`
    
    // TC'yi çekiyoruz ve temizliyoruz (baş/son boşlukları siliniyor)
    const rawIdentityNumber = (customer?.metadata as any)?.identity_number
    const identityNumber = rawIdentityNumber ? String(rawIdentityNumber).trim() : ""

    // TC KİMLİK KONTROLÜ (Boş mu veya Yanlış mı?)
    if (!isValidTCKN(identityNumber)) {
      return {
        id: conversationId,
        data: {
          error:
            "Ödeme yapabilmek için lütfen Profil sayfanızdan geçerli bir TC Kimlik Numarası giriniz (Yasal Zorunluluk).",
        },
      }
    }

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId,
      price: this.toIyzicoAmount(amount),
      paidPrice: this.toIyzicoAmount(amount),
      currency: this.mapCurrency(currency_code),
      basketId: conversationId,
      callbackUrl: `${process.env.MEDUSA_BACKEND_URL}/iyzico/callback`,
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: customer?.id ?? "guest",
        name: customer?.first_name || "Musteri",
        surname: customer?.last_name || "-",
        email: customer?.email || "guest@example.com",
        gsmNumber: customer?.phone || customer?.billing_address?.phone || "+905000000000",
        identityNumber,
        registrationAddress:
          customer?.billing_address?.address_1 || "Adres belirtilmedi",
        ip: (context as any)?.ip_address || "127.0.0.1",
        city: customer?.billing_address?.city || "Istanbul",
        country: customer?.billing_address?.country_code || "Turkey",
        zipCode: customer?.billing_address?.postal_code || "00000",
        registrationDate: this.toIyzicoDate(customer?.created_at),
        lastLoginDate: this.toIyzicoDate(customer?.updated_at),
      },
      shippingAddress: this.mapAddress(customer?.shipping_address),
      billingAddress: this.mapAddress(customer?.billing_address),
      basketItems: [
        {
          id: conversationId,
          name: "Siparis",
          category1: "Genel",
          itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
          price: this.toIyzicoAmount(amount),
        },
      ],
    }

    const callIyzico = (): Promise<any> =>
      new Promise((resolve, reject) => {
        this.client_.checkoutFormInitialize.create(request, (err: any, result: any) => {
          if (err) {
            reject(err)
            return
          }
          resolve(result)
        })
      })

    let lastError: any = null

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await callIyzico()
        console.log("IYZICO RESULT:", this.serializeForLog(result))

        if (result.status !== "success") {
          console.error("IYZICO RESULT ERROR:", this.serializeForLog(result))
          return {
            id: conversationId,
            data: {
              error: this.getIyzicoErrorMessage(result),
            },
          }
        }

        return {
          id: conversationId,
          data: {
            token: result.token,
            checkoutFormContent: result.checkoutFormContent,
            paymentPageUrl: result.paymentPageUrl,
            conversationId,
          },
        }
      } catch (err: any) {
        lastError = err
        console.error(
          `IYZICO ERROR (deneme ${attempt}/3):`,
          this.serializeForLog(err)
        )
        await new Promise((r) => setTimeout(r, 500))
      }
    }

    return {
      id: conversationId,
      data: {
        error: this.getIyzicoErrorMessage(lastError),
      },
    }
  }

  async authorizePayment(input: any): Promise<any> {
    const token = (input.data as any)?.token

    if (!token) {
      return {
        data: input.data,
        status: "pending",
      }
    }

    return new Promise((resolve) => {
      this.client_.checkoutForm.retrieve(
        { locale: Iyzipay.LOCALE.TR, token },
        (err: any, result: any) => {
          if (err || result.status !== "success" || result.paymentStatus !== "SUCCESS") {
            resolve({
              data: input.data,
              status: "error",
            })
            return
          }

          resolve({
            data: {
              ...input.data,
              paymentId: result.paymentId,
              paymentTransactionId:
                result.itemTransactions?.[0]?.paymentTransactionId,
              fraudStatus: result.fraudStatus,
              //Bu eklendi
              //Kaç para çektiği
              paidPrice: result.paidPrice,
              //Kaç taksit yaptığı
              installment: result.installment,
            },
            status: "captured",
          })
        }
      )
    })
  }

  async capturePayment(input: any): Promise<any> {
    return { data: input.data }
  }

  async cancelPayment(input: any): Promise<any> {
    const paymentId = (input.data as any)?.paymentId

    return new Promise((resolve) => {
      this.client_.cancel.create(
        {
          locale: Iyzipay.LOCALE.TR,
          paymentId,
          ip: "127.0.0.1",
        },
        (err: any, result: any) => {
          if (err || result.status !== "success") {
            resolve({ data: input.data })
            return
          }
          resolve({ data: { ...input.data, canceled: true } })
        }
      )
    })
  }

  async deletePayment(input: any) {
    return this.cancelPayment(input)
  }

  async refundPayment(input: any): Promise<any> {
    const { data, amount } = input
    const paymentId = (data as any)?.paymentId
    let paymentTransactionId = (data as any)?.paymentTransactionId

    if (!paymentTransactionId && paymentId) {
      const payment = await new Promise<any>((resolve, reject) => {
        this.client_.payment.retrieve(
          {
            locale: Iyzipay.LOCALE.TR,
            conversationId: (data as any)?.conversationId ?? `refund_${paymentId}`,
            paymentId,
          },
          (err: any, result: any) => {
            if (err) {
              reject(err)
              return
            }
            resolve(result)
          }
        )
      })

      if (payment.status !== "success") {
        throw new MedusaError(
          MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR,
          `iyzico ödeme bilgisi alınamadı: ${
            payment.errorMessage ?? "Bilinmeyen hata"
          }`
        )
      }

      paymentTransactionId = payment.itemTransactions?.[0]?.paymentTransactionId
    }

    if (!paymentTransactionId) {
      throw new MedusaError(
        MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR,
        `iyzico iade için paymentTransactionId bulunamadı (paymentId: ${paymentId ?? "yok"})`
      )
    }

    const result = await new Promise<any>((resolve, reject) => {
      this.client_.refund.create(
        {
          locale: Iyzipay.LOCALE.TR,
          paymentTransactionId,
          price: this.toIyzicoAmount(amount),
          ip: "127.0.0.1",
        },
        (err: any, response: any) => {
          if (err) {
            reject(err)
            return
          }
          resolve(response)
        }
      )
    })

    if (result.status !== "success") {
      throw new MedusaError(
        MedusaError.Types.PAYMENT_REQUIRES_MORE_ERROR,
        `iyzico iade başarısız: ${result.errorCode ?? "Bilinmeyen hata"} - ${
          result.errorMessage ?? "Bilinmeyen hata"
        }`
      )
    }

    return {
      data: {
        ...data,
        paymentTransactionId,
        refunded: true,
      },
    }
  }

  async retrievePayment(input: any): Promise<any> {
    return { data: input.data }
  }

  async updatePayment(input: any): Promise<any> {
    return this.initiatePayment(input as any)
  }

  async getPaymentStatus(input: any): Promise<any> {
    const status = (input.data as any)?.paymentId ? "authorized" : "pending"
    return { status }
  }

  async getWebhookActionAndData(payload: any): Promise<any> {
    return {
      action: "not_supported",
    }
  }

  private toIyzicoAmount(amount: any): string {
    const numericValue =
      typeof amount === "object" && amount !== null && "value" in amount
        ? Number(amount.value)
        : Number(amount)

    return numericValue.toFixed(2)
  }

  private mapCurrency(code?: string): string {
    const map: Record<string, string> = {
      try: Iyzipay.CURRENCY.TRY,
      usd: Iyzipay.CURRENCY.USD,
      eur: Iyzipay.CURRENCY.EUR,
    }
    return map[(code || "try").toLowerCase()] || Iyzipay.CURRENCY.TRY
  }

  private toIyzicoDate(value?: string | Date): string {
    const date = value ? new Date(value) : new Date()

    if (Number.isNaN(date.getTime())) {
      return this.toIyzicoDate()
    }

    const pad = (part: number) => String(part).padStart(2, "0")

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}`
  }

  private serializeForLog(value: any): string {
    if (value instanceof Error) {
      return JSON.stringify({
        name: value.name,
        message: value.message,
        code: (value as any).code,
        response: (value as any).response,
        stack: value.stack,
      })
    }

    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }

  private getIyzicoErrorMessage(value: any): string {
    return (
      value?.errorMessage ||
      value?.message ||
      value?.errorCode ||
      "iyzico ödeme başlatma hatası"
    )
  }

  private normalizeBaseUrl(value: string): string {
    const baseUrl = value.trim()
    const markdownUrl = baseUrl.match(/^\[(https?:\/\/[^\]]+)\]\((https?:\/\/[^)]+)\)$/)
    const normalizedUrl = markdownUrl?.[2] ?? baseUrl

    return normalizedUrl.replace(/\/+$/, "")
  }

  private mapAddress(address: any) {
    return {
      contactName: address
        ? `${address.first_name || ""} ${address.last_name || ""}`.trim()
        : "Musteri",
      city: address?.city || "Istanbul",
      country: address?.country_code || "Turkey",
      address: address?.address_1 || "Adres belirtilmedi",
      zipCode: address?.postal_code || "00000",
    }
  }
}

export default IyzicoPaymentProviderService