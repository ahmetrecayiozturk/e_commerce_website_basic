"use client"

import React, { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const email = searchParams.get("email")
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    if (password !== confirmPassword) {
      setError("Şifreler birbiriyle eşleşmiyor.")
      setIsLoading(false)
      return
    }

    try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/auth/customer/emailpass/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          "Authorization": `Bearer ${token}` // DÜZELTME: Token'ı güvenlik başlığına taşıdık!
        },
        body: JSON.stringify({
          password: password
        }),
      })

      if (res.ok) {
        setMessage("Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...")
        setTimeout(() => {
          router.push("/account")
        }, 3000)
      } else {
        setError("Şifre sıfırlama işlemi başarısız oldu. Linkin süresi dolmuş olabilir.")
      }
    } catch (err) {
      setError("Sunucuya ulaşılamadı.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!email || !token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Geçersiz Bağlantı</h1>
        <p className="text-gray-600">Bu şifre sıfırlama bağlantısı eksik veya geçersiz.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
      <div className="max-w-sm w-full bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900 mb-2 text-center">Yeni Şifre Belirle</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">{email} hesabı için yeni şifrenizi girin.</p>
        
        {message ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-md text-sm text-center border border-green-200">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
            <Input
              label="Yeni Şifre"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Yeni Şifreyi Onayla"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            
            <ErrorMessage error={error} />
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh]">Yükleniyor...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}