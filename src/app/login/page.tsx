"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PasswordInput } from "@/components/password-input"
import { SocialAuthButtons } from "@/components/social-auth-buttons"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthError } from "@/lib/auth-api"
import { useDadok } from "@/lib/store"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useDadok()
  const [loginId, setLoginId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    setPending(true)
    try {
      await login(loginId, password)
      router.replace("/")
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "로그인에 실패했습니다.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="pt-10">
      <form onSubmit={onSubmit} className="space-y-7">
        <div className="space-y-2.5">
          <Label htmlFor="loginId" className="px-1 text-[15px] text-[var(--wood-deep)]">
            아이디
          </Label>
          <div className="sketch-frame rounded-[14px]">
            <Input
              id="loginId"
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              autoComplete="username"
              className="h-14 rounded-[14px] border-0 bg-transparent px-4 shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
              required
            />
          </div>
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="password" className="px-1 text-[15px] text-[var(--wood-deep)]">
            비밀번호
          </Label>
          <div className="sketch-frame rounded-[14px]">
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />
          </div>
        </div>
        {error ? <p className="text-sm text-[var(--destructive)]">{error}</p> : null}
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
