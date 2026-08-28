"use client"

import { StudyRoom } from "@/components/study-room"
import { useDadok } from "@/lib/store"

export default function StudyPage() {
  const { profile } = useDadok()

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">{profile.nickname}의 방</p>
      <StudyRoom />
    </div>
  )
}
