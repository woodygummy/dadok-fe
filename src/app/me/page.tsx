"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDadok } from "@/lib/store"
import { THEME_LABEL, type ThemeName } from "@/lib/types"

const THEMES: ThemeName[] = ["white", "dark", "wood"]

export default function MePage() {
  const { profile, setNickname, setTheme, logout } = useDadok()
  const [nickname, setNicknameDraft] = useState(profile.nickname)

  useEffect(() => {
    setNicknameDraft(profile.nickname)
  }, [profile.nickname])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">마이페이지</h1>
      </header>

      <section className="space-y-3 rounded-[20px] bg-card p-4 ring-1 ring-foreground/10">
        <h2 className="text-sm font-medium">계정 정보</h2>
        <p className="text-sm text-muted-foreground">게스트 계정</p>
        <p className="text-sm">{profile.email}</p>
      </section>

      <section className="space-y-3 rounded-[20px] bg-card p-4 ring-1 ring-foreground/10">
        <h2 className="text-sm font-medium">닉네임</h2>
        <div className="flex gap-2">
          <Input
            value={nickname}
            onChange={(event) => setNicknameDraft(event.target.value)}
            maxLength={16}
          />
          <Button
            onClick={() => setNickname(nickname)}
            disabled={!nickname.trim()}
          >
            저장
          </Button>
        </div>
      </section>

      <section className="space-y-3 rounded-[20px] bg-card p-4 ring-1 ring-foreground/10">
        <h2 className="text-sm font-medium">테마 선택하기</h2>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((theme) => (
            <Button
              key={theme}
              variant={profile.theme === theme ? "default" : "outline"}
              onClick={() => setTheme(theme)}
            >
              {THEME_LABEL[theme]}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-[20px] bg-card p-4 ring-1 ring-foreground/10">
        <h2 className="text-sm font-medium">문의 하기</h2>
        <Button
          variant="outline"
          onClick={() => {
            window.location.href = "mailto:support@dadok.app?subject=다독 문의"
          }}
        >
          메일 보내기
        </Button>
      </section>

      <Button variant="destructive" className="w-full" onClick={logout}>
        로그아웃
      </Button>
    </div>
  )
}
