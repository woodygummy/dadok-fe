"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { readAvatarFile } from "@/lib/read-avatar"
import { useDadok } from "@/lib/store"
import { THEME_LABEL, type ThemeName } from "@/lib/types"

const THEMES: ThemeName[] = ["white", "dark", "wood"]

export default function MePage() {
  const { profile, setNickname, setTheme, setAvatar, logout } = useDadok()
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
          <h2 className="shrink-0 text-sm font-medium">계정 정보</h2>
          <p className="min-w-0 truncate text-right text-sm text-muted-foreground">
            {profile.email}
          </p>
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
          onClick={logout}
        >
          로그아웃
        </Button>
      </div>
      </div>
    </div>
  )
}
