"use client"

import React, { useEffect, useActionState } from "react"
import Input from "@modules/common/components/input"
import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { updateCustomer } from "@lib/data/customer"

// --- TC KİMLİK DOĞRULAMA ALGORİTMASI ---
function isValidTCKN(tc: string): boolean {
  // 11 haneli değilse veya sadece rakamlardan oluşmuyorsa veya ilk hanesi 0 ise direkt false
  if (!tc || !/^[1-9][0-9]{10}$/.test(tc)) return false;

  const digits = tc.split('').map(Number);
  
  // 1, 3, 5, 7 ve 9. hanelerin toplamı
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  // 2, 4, 6 ve 8. hanelerin toplamı
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

  // 10. hane kontrolü
  const tenthDigit = (oddSum * 7 - evenSum) % 10;
  if (tenthDigit !== digits[9]) return false;

  // 11. hane kontrolü
  const totalSum = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  if (totalSum % 10 !== digits[10]) return false;

  return true;
}

type Props = {
  customer: HttpTypes.StoreCustomer
}

const ProfileIdentityNumber: React.FC<Props> = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)

  const currentValue = (customer.metadata as any)?.identity_number || ""

  const updateIdentityNumber = async (
    _currentState: Record<string, unknown>,
    formData: FormData
  ) => {
    const identityNumber = (formData.get("identity_number") as string || "").trim()

    // ALGORTİMA KONTROLÜ BURADA YAPILIYOR
    if (!isValidTCKN(identityNumber)) {
      return {
        success: false,
        error: "Lütfen geçerli bir TC Kimlik Numarası giriniz.", // Uyarı mesajını güncelledik
      }
    }

    try {
      await updateCustomer({
        metadata: {
          ...(customer.metadata || {}),
          identity_number: identityNumber,
        },
      })
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  const [state, formAction] = useActionState(updateIdentityNumber, {
    error: null as string | null,
    success: false,
  })

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    if (state.success) {
      setSuccessState(true)
    }
  }, [state])

  return (
    <form action={formAction} className="w-full">
      <AccountInfo
        label="TC Kimlik No"
        currentInfo={currentValue || "Girilmedi"}
        isSuccess={successState}
        isError={!!state?.error}
        errorMessage={state?.error ?? undefined}
        clearState={clearState}
        data-testid="account-identity-number-editor"
      >
        <div className="grid grid-cols-1 gap-y-2">
          <Input
            label="TC Kimlik No"
            name="identity_number"
            required
            maxLength={11}
            pattern="[1-9][0-9]{10}"
            defaultValue={currentValue}
            data-testid="identity-number-input"
          />
          <span className="text-xs text-ui-fg-subtle">
            Ödeme sağlayıcımız (iyzico) yasal olarak bu bilgiyi zorunlu
            kılıyor. Sadece ödeme işlemlerinde kullanılır.
          </span>
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfileIdentityNumber