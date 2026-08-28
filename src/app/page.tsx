"use client"

import { StudyRoom } from "@/components/study-room"
import { useDadok } from "@/lib/store"

export default function StudyPage() {
  const { profile } = useDadok()

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm text-muted-foreground">{profile.nickname}의 방</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">나만의 서재</h1>
      </header>
      <StudyRoom />
    </div>
  )
}
