"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PasswordInput } from "@/components/password-input"
import { SocialAuthButtons } from "@/components/social-auth-buttons"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthError } from "@/lib/auth-api"
import {
  loginErrorFromMessage,
  validateLoginFields,
  type LoginFieldErrors,
} from "@/lib/auth-validate"
import { useDadok } from "@/lib/store"
import { cn } from "@/lib/utils"

const fieldClass =
  "h-14 rounded-[14px] border-0 bg-transparent px-4 shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"

function FieldHint({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="px-1 text-sm text-[var(--destructive)]">
      {message}
    </p>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { login } = useDadok()
  const [loginId, setLoginId] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<LoginFieldErrors>({})
  const [formError, setFormError] = useState("")
  const [pending, setPending] = useState(false)

  function clearField(field: keyof LoginFieldErrors) {
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    const nextErrors = validateLoginFields({ loginId, password })
    if (Object.keys(nextErrors).length > 0) {
      setFormError("")
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setFormError("")
    setPending(true)
    try {
      await login(loginId, password)
      router.replace("/")
    } catch (err) {
      const message =
        err instanceof AuthError
          ? err.message
          : "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요."
      const mapped = loginErrorFromMessage(message)
      if (Object.keys(mapped).length > 0) setErrors(mapped)
      else setFormError(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="pt-10">
      <form onSubmit={onSubmit} noValidate className="space-y-7">
        <div className="space-y-2.5">
          <Label htmlFor="loginId" className="px-1 text-[15px] text-[var(--wood-deep)]">
            아이디
          </Label>
          <div className="sketch-frame rounded-[14px]">
            <Input
              id="loginId"
              value={loginId}
              onChange={(event) => {
                setLoginId(event.target.value)
                clearField("loginId")
              }}
              autoComplete="username"
              aria-invalid={Boolean(errors.loginId) || undefined}
              aria-describedby={errors.loginId ? "loginId-error" : undefined}
              className={fieldClass}
            />
          </div>
          <FieldHint id="loginId-error" message={errors.loginId} />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="password" className="px-1 text-[15px] text-[var(--wood-deep)]">
            비밀번호
          </Label>
          <div className="sketch-frame rounded-[14px]">
            <PasswordInput
              id="password"
              value={password}
              onChange={(value) => {
                setPassword(value)
                clearField("password")
              }}
              autoComplete="current-password"
              invalid={Boolean(errors.password)}
              describedBy={errors.password ? "password-error" : undefined}
            />
          </div>
          <FieldHint id="password-error" message={errors.password} />
        </div>
        {formError ? (
          <p className="text-sm text-[var(--destructive)]">{formError}</p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "sketch-frame sketch-frame-fill mt-2 h-14 w-full rounded-[14px] text-[15px] font-medium text-[#FFF8F0]",
            "disabled:opacity-60"
          )}
        >
          {pending ? "들어가는 중…" : "로그인"}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-[var(--muted-ink)]">
        아직 계정이 없나요?{" "}
        <Link href="/signup" className="text-[var(--wood-deep)]">
          회원가입
        </Link>
      </p>

      <div className="mt-10 space-y-6">
        <div className="flex items-center gap-3 text-[13px] text-[var(--muted-ink)]">
          <span className="sketch-line flex-1" />
          또는
          <span className="sketch-line flex-1" />
        </div>
        <SocialAuthButtons variant="icons" />
      </div>
    </div>
  )
}
