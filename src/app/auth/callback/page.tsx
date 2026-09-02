"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDadok } from "@/lib/store"

const ERROR_COPY: Record<string, string> = {
  oauth_denied: "소셜 로그인이 취소되었습니다.",
  oauth_failed: "소셜 로그인에 실패했습니다. 콘솔 설정을 확인해 주세요.",
  oauth_not_configured: "소셜 앱 키가 아직 백엔드에 없습니다. .env를 확인해 주세요.",
  already_linked: "이미 다른 계정에 연동된 소셜입니다.",
  unauthorized: "로그인이 만료되었습니다. 다시 로그인해 주세요.",
  unknown_provider: "지원하지 않는 로그인입니다.",
}

function AuthCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { completeOAuth, session } = useDadok()
  const [message, setMessage] = useState("서재 문을 여는 중…")

  useEffect(() => {
    const error = searchParams.get("error")
    const token = searchParams.get("token")
    if (error) {
      setMessage(ERROR_COPY[error] ?? "소셜 로그인에 실패했습니다.")
      return
    }
    if (!token) {
      setMessage("로그인 정보가 없습니다.")
      return
    }
    completeOAuth(token)
      .then(() => router.replace(session ? "/me/account" : "/"))
      .catch(() => setMessage("로그인 정보를 확인하지 못했습니다."))
  }, [completeOAuth, router, searchParams, session])

  const failed = message !== "서재 문을 여는 중…"

  return (
    <div className="space-y-4 pt-16 text-center">
      <p className="font-serif text-xl text-[var(--wood-deep)]">{message}</p>
      {failed ? (
        <button
          type="button"
          className="text-sm text-[var(--terracotta)] underline-offset-4 hover:underline"
          onClick={() => router.replace("/login")}
        >
          로그인으로 돌아가기
        </button>
      ) : null}
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <p className="pt-16 text-center font-serif text-xl text-[var(--wood-deep)]">
          서재 문을 여는 중…
        </p>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  )
}
