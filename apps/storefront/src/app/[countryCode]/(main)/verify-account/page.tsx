import { Metadata } from "next"
import { Suspense } from "react"

import VerifyAccount from "@modules/account/components/verify-account"

export const metadata: Metadata = {
  title: "E -posta Adresinizi Doğrulayın",
  description: "E-posta adresinizi doğrulayarak hesabınızı tamamlayın.",
}

export default function VerifyAccountPage() {
  return (
    <div className="w-full flex justify-center px-8 py-12">
      <Suspense
        fallback={
          <p className="text-base-regular text-ui-fg-base">
            E-posta doğrulanıyor...
          </p>
        }
      >
        <VerifyAccount />
      </Suspense>
    </div>
  )
}
