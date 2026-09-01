"use client"

import { Bell } from "lucide-react"
import Link from "next/link"

export function HeaderBell() {
  return (
    <Link href="/me/alerts" aria-label="알림" className="relative p-1">
      <Bell className="size-6 text-[#3b2414]" strokeWidth={1.8} />
    </Link>
  )
}
