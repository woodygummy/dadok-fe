"use client"

import Link from "next/link"
import { Bookshelf } from "@/components/bookshelf"

export function StudyRoom() {
  return (
    <div className="relative overflow-visible rounded-[28px] border border-[rgba(92,74,58,0.18)] bg-[var(--room)] p-6 shadow-[0_12px_28px_rgba(59,36,20,0.12)]">
      <Bookshelf compact />
      <Link
        href="/shelf"
        className="mt-2 block text-center text-sm text-foreground outline-none"
      >
        책장 · 눌러서 책장으로 이동
      </Link>
    </div>
  )
}
