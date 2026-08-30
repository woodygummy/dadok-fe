"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PasswordInput } from "@/components/password-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthError } from "@/lib/auth-api"
import {
  fieldErrorFromMessage,
  validateSignupFields,
  type SignupFieldErrors,
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

export default function SignupPage() {
  const router = useRouter()
  const { register } = useDadok()
  const [loginId, setLoginId] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<SignupFieldErrors>({})
  const [formError, setFormError] = useState("")
  const [pending, setPending] = useState(false)

  function clearField(field: keyof SignupFieldErrors) {
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    const nextErrors = validateSignupFields({ loginId, password, email })
    if (Object.keys(nextErrors).length > 0) {
      setFormError("")
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setFormError("")
    setPending(true)
    try {
      await register({ loginId, email, password })
      router.replace("/")
    } catch (err) {
      const message =
        err instanceof AuthError
          ? err.message
          : "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요."
      const mapped = fieldErrorFromMessage(message)
      if (Object.keys(mapped).length > 0) setErrors(mapped)
      else setFormError(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-7.5rem)] flex-col pt-10">
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
              autoComplete="new-password"
              invalid={Boolean(errors.password)}
              describedBy={errors.password ? "password-error" : undefined}
            />
          </div>
          <FieldHint id="password-error" message={errors.password} />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="email" className="px-1 text-[15px] text-[var(--wood-deep)]">
            이메일
          </Label>
          <div className="sketch-frame rounded-[14px]">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                clearField("email")
              }}
              autoComplete="email"
              aria-invalid={Boolean(errors.email) || undefined}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={fieldClass}
            />
          </div>
          <FieldHint id="email-error" message={errors.email} />
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
          {pending ? "만드는 중…" : "회원가입"}
        </button>
      </form>

      <p className="mt-auto pb-6 pt-10 text-center">
        <Link href="/login" className="text-[15px] text-[var(--muted-ink)]">
          이전
        </Link>
      </p>
    </div>
  )
}
