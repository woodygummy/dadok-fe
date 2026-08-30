"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { readAvatarFile } from "@/lib/read-avatar"
import { SocialAuthButtons } from "@/components/social-auth-buttons"
import { useDadok } from "@/lib/store"
import { THEME_LABEL, type Provider, type ThemeName } from "@/lib/types"

const THEMES: ThemeName[] = ["white", "dark", "wood"]
const PROVIDER_LABEL: Record<Provider, string> = {
  kakao: "카카오",
  naver: "네이버",
  google: "Google",
}

export default function MePage() {
  const { profile, session, setNickname, setTheme, setAvatar, logout } = useDadok()
  const router = useRouter()
  const [nickname, setNicknameDraft] = useState(profile.nickname)

  useEffect(() => {
    setNicknameDraft(profile.nickname)
  }, [profile.nickname])

  function saveNickname() {
    if (!nickname.trim()) {
      setNicknameDraft(profile.nickname)
      return
    }
    setNickname(nickname)
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    try {
      setAvatar(await readAvatarFile(file))
    } catch {
      // keep the previous photo
    }
  }

  const initial = profile.nickname.trim().slice(0, 1) || "다"
  const linked = session?.user.providers ?? []
  const loginId = session?.user.loginId ?? ""
  const emailLabel = profile.email || (session?.user.hasPassword ? "" : "소셜 가입")

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2">
        <div className="relative size-24">
          <div className="size-full overflow-hidden rounded-full border-4 border-[var(--wood)] bg-[var(--niche)] shadow-[0_10px_24px_rgba(59,36,20,0.16)]">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <span className="flex size-full items-center justify-center font-serif text-3xl text-[var(--wood)]">
                {initial}
              </span>
            )}
          </div>
          <label className="absolute right-0 bottom-0 flex size-7 cursor-pointer items-center justify-center rounded-full border-2 border-[var(--wood)] bg-[var(--card)] text-[var(--wood)] shadow-[0_4px_10px_rgba(59,36,20,0.14)]">
            <Pencil className="size-3.5" strokeWidth={2.2} />
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label="프로필 사진 바꾸기"
              onChange={handleAvatarChange}
            />
          </label>
        </div>
        <Input
          value={nickname}
          onChange={(event) => setNicknameDraft(event.target.value)}
          onBlur={saveNickname}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur()
            }
          }}
          maxLength={16}
          className="h-8 w-auto max-w-[12rem] border-0 bg-transparent px-0 text-center font-serif text-lg font-semibold shadow-none focus-visible:ring-0"
          aria-label="닉네임"
        />
      </div>

      <div className="space-y-2">
      <section className="overflow-hidden rounded-[20px] bg-card ring-1 ring-foreground/10">
        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <h2 className="shrink-0 text-sm font-medium">아이디</h2>
          <p className="min-w-0 truncate text-right text-sm text-muted-foreground">
            {loginId}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[rgba(92,74,58,0.12)] px-4 py-3.5">
          <h2 className="shrink-0 text-sm font-medium">이메일</h2>
          <p className="min-w-0 truncate text-right text-sm text-muted-foreground">
            {emailLabel || "없음"}
          </p>
        </div>

        <div className="border-t border-[rgba(92,74,58,0.12)] px-4 py-3.5">
          <h2 className="text-sm font-medium">소셜 연동</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {linked.length
              ? linked.map((provider) => PROVIDER_LABEL[provider]).join(" · ")
              : "아직 연동된 계정이 없습니다"}
          </p>
          {session ? (
            <div className="mt-3">
              <SocialAuthButtons
                token={session.token}
                mode="link"
                providers={(["kakao", "naver", "google"] as Provider[]).filter(
                  (provider) => !linked.includes(provider)
                )}
              />
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[rgba(92,74,58,0.12)] px-4 py-3.5">
          <h2 className="shrink-0 text-sm font-medium">테마</h2>
          <div className="flex flex-wrap justify-end gap-1.5">
            {THEMES.map((theme) => (
              <Button
                key={theme}
                size="sm"
                variant={profile.theme === theme ? "default" : "outline"}
                className="rounded-2xl"
                onClick={() => setTheme(theme)}
              >
                {THEME_LABEL[theme]}
              </Button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 border-t border-[rgba(92,74,58,0.12)] px-4 py-3.5 text-left"
          onClick={() => {
            window.location.href = "mailto:support@dadok.app?subject=다독 문의"
          }}
        >
          <h2 className="shrink-0 text-sm font-medium">문의 하기</h2>
          <span className="text-sm text-muted-foreground">메일 보내기</span>
        </button>
      </section>

      <div className="flex justify-end px-1">
        <Button
          variant="ghost"
          className="h-auto border-0 bg-transparent px-0 text-sm text-[var(--destructive)] shadow-none hover:bg-transparent hover:text-[var(--destructive)]"
          onClick={() => {
            logout()
            router.replace("/login")
          }}
        >
          로그아웃
        </Button>
      </div>
      </div>
    </div>
  )
}
