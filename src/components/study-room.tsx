"use client"

import Link from "next/link"
import { Bookshelf } from "@/components/bookshelf"

export function StudyRoom() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[rgba(92,74,58,0.18)] bg-[var(--room)] shadow-[0_12px_28px_rgba(59,36,20,0.12)]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:repeating-linear-gradient(90deg,transparent,transparent_18px,rgba(92,74,58,0.35)_18px,rgba(92,74,58,0.35)_19px)]" />

      <div className="relative px-5 pt-5">
        <div className="mx-auto h-28 w-[78%] overflow-hidden rounded-[18px] border-[6px] border-[var(--wood)] bg-[var(--sky)] shadow-[inset_0_0_0_3px_rgba(255,248,240,0.35)]">
          <div className="h-full w-full bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.7),transparent_28%),linear-gradient(#c5dce8,#7aa8b8)]" />
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">창문</p>
      </div>

      <div className="relative px-6 py-3">
        <Link href="/shelf" className="block outline-none">
          <Bookshelf compact />
          <p className="mt-2 text-center text-sm text-foreground">
            책장 · 눌러서 책장으로 이동
          </p>
        </Link>
      </div>

      <div className="relative flex items-end justify-between gap-3 px-6 pb-6 pt-2">
        <div className="flex w-16 flex-col items-center">
          <div className="h-10 w-10 rounded-full bg-[var(--sage)] shadow-[0_6px_12px_rgba(61,107,79,0.25)]" />
          <div className="h-8 w-8 rounded-b-md bg-[var(--terracotta)]" />
          <p className="mt-1 text-[11px] text-muted-foreground">화분</p>
        </div>

        <div className="flex flex-1 flex-col items-center">
          <div className="h-10 w-16 rounded-t-[18px] bg-[color-mix(in_srgb,var(--wood)_70%,#1a1a1a)]" />
          <div className="flex w-20 justify-between px-1">
            <span className="h-8 w-2 rounded-b bg-[var(--wood)]" />
            <span className="h-8 w-2 rounded-b bg-[var(--wood)]" />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">의자</p>
        </div>

        <div className="flex w-24 flex-col items-center">
          <div className="h-3 w-full rounded-sm bg-[var(--wood)]" />
          <div className="flex w-full justify-between px-2">
            <span className="h-8 w-2 bg-[var(--wood-deep)]" />
            <span className="h-8 w-2 bg-[var(--wood-deep)]" />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">책상</p>
        </div>
      </div>
    </div>
  )
}
