"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"
import { BackLink } from "@/components/back-link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SocialAuthButtons } from "@/components/social-auth-buttons"
import { readAvatarFile } from "@/lib/read-avatar"
import { useDadok } from "@/lib/store"
import { type Provider } from "@/lib/types"

const PROVIDER_LABEL: Record<Provider, string> = {
  kakao: "카카오",
  naver: "네이버",
  google: "Google",
}

export default function AccountPage() {
  const { profile, session, setNickname, setAvatar, logout } = useDadok()
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
      <BackLink href="/me" />

      <div className="flex flex-col items-center gap-2">
        <div className="relative size-24">
          <div className="size-full overflow-hidden rounded-full bg-[#d8d4cf]">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center font-serif text-3xl text-[var(--wood)]">
                {initial}
              </span>
            )}
          </div>
          <label className="absolute right-0 bottom-0 flex size-7 cursor-pointer items-center justify-center rounded-full border-2 border-[var(--wood)] bg-[var(--card)] text-[var(--wood)]">
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

      <section className="sketch-frame overflow-hidden rounded-[18px] bg-[var(--niche)]">
        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <h2 className="shrink-0 text-sm font-medium">아이디</h2>
          <p className="min-w-0 truncate text-right text-sm text-muted-foreground">{loginId}</p>
        </div>
        <div className="sketch-line mx-4" />
        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <h2 className="shrink-0 text-sm font-medium">이메일</h2>
          <p className="min-w-0 truncate text-right text-sm text-muted-foreground">
            {emailLabel || "없음"}
          </p>
        </div>
        <div className="sketch-line mx-4" />
        <div className="px-4 py-3.5">
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
  )
}
