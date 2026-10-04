"use client"

import { useActionState, useState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [touched, setTouched] = useState(false)

  const passwordsMismatch =
    touched && confirmPassword.length > 0 && password !== confirmPassword

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setTouched(true)
    if (password !== confirmPassword) {
      e.preventDefault()
    }
  }

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        Hesap Oluştur
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        LegnoNest üyelik profilinizi oluşturun ve size özel fırsatlardan yararlanın
      </p>
      {message?.state === "verification_required" && (
        <div
          className="w-full mb-4 text-center text-base-regular text-ui-fg-base bg-ui-bg-subtle border border-ui-border-base rounded-rounded p-4"
          data-testid="register-verification-message"
        >
          Doğrulama bağlantısı <strong>{message.email}</strong> adresine gönderildi.
          Lütfen e-posta kutusunu kontrol edin ve e-postanızı doğrulayın, ardından giriş yapın.
        </div>
      )}
      <form
        className="w-full flex flex-col"
        action={formAction}
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="İsim"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Soyisim"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Telefon"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Şifre"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Şifre onayla"
            name="confirm_password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="confirm-password-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {passwordsMismatch && (
          <span className="text-rose-500 text-small-regular mt-2">
            Şifreler eşleşmiyor.
          </span>
        )}
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="register-error"
        />
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          Hesap oluşturarak, LegnoNest&apos;in {" "} zorunlu olarak Gizlilik Politikası ve Kullanım Şartları&apos;nı kabul etmiş olursunuz. Lütfen bu belgeleri dikkatlice okuyun.'
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="underline"
          >
            Gizlilik Politikası
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="underline"
          >
            Kullanım Şartları
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          Üye Ol
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Zaten üye misin?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Giriş Yap
        </button>
        .
      </span>
    </div>
  )
}

export default Register