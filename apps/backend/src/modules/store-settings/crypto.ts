import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"
import { MedusaError } from "@medusajs/framework/utils"

const getKey = () => {
  const secret = process.env.SECRETS_ENCRYPTION_KEY
  if (!secret) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "SECRETS_ENCRYPTION_KEY yapılandırılmamış."
    )
  }
  return createHash("sha256").update(secret).digest()
}

export const encryptSecret = (value?: string | null) => {
  if (!value) return null
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()])
  return `${iv.toString("base64")}.${cipher.getAuthTag().toString("base64")}.${encrypted.toString("base64")}`
}

export const decryptSecret = (value?: string | null) => {
  if (!value) return ""
  const [ivValue, tagValue, encryptedValue] = value.split(".")
  if (!ivValue || !tagValue || !encryptedValue) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Geçersiz şifreli ayar.")
  }
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivValue, "base64"))
  decipher.setAuthTag(Buffer.from(tagValue, "base64"))
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64")),
    decipher.final(),
  ]).toString("utf8")
}
