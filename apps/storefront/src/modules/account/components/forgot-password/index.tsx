"use client"

import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import Input from "@modules/common/components/input"
import React, { useState } from "react"
import ErrorMessage from "@modules/checkout/components/error-message"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const ForgotPassword = ({ setCurrentView }: Props) => {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email")?.toString() || ""

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setMessage("Sıfırlama linki e-posta adresinize gönderildi. Lütfen gelen kutunuzu ve spam klasörünüzü kontrol edin.")
      } else {
        setError("Bu e-posta adresiyle eşleşen bir hesap bulunamadı.")
      }
    } catch (err) {
      setError("Sunucuya ulaşılamıyor, lütfen daha sonra tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-sm w-full flex flex-col items-center" data-testid="forgot-password-page">
      <h1 className="text-large-semi uppercase mb-6">Şifremi Unuttum</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        E-posta adresinizi girin. Size şifrenizi sıfırlayabileceğiniz bir bağlantı göndereceğiz.
      </p>
      
      {message ? (
        <div className="w-full bg-green-50 text-green-700 p-4 rounded-md text-sm mb-6 text-center border border-green-200">
          {message}
        </div>
      ) : (
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col w-full gap-y-2">
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              data-testid="reset-email-input"
            />
          </div>
          
          <ErrorMessage error={error} data-testid="forgot-password-error" />
          
          {/* TypeScript hatası veren SubmitButton yerine Tailwind ile stillendirilmiş standart buton eklendi */}
          <button
            type="submit"
            disabled={isLoading}
            data-testid="reset-password-button"
            className="w-full mt-6 bg-gray-900 text-white py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Gönderiliyor..." : "Sıfırlama Linki Gönder"}
          </button>
        </form>
      )}
      
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        <button
          type="button"
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Giriş ekranına dön
        </button>
      </span>
    </div>
  )
}

export default ForgotPassword