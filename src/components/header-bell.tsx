"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"
import { fetchInquiryUnread } from "@/lib/inquiry-api"
import { useDadok } from "@/lib/store"

export function HeaderBell() {
  const { session } = useDadok()
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!session?.token) return
    fetchInquiryUnread(session.token)
      .then(setUnread)
      .catch(() => setUnread(0))
  }, [pathname, session?.token])

  return (
    <Link href="/me/alerts" aria-label={unread ? `알림 ${unread}개` : "알림"} className="relative p-1">
      <Bell className="size-6 text-[#3b2414]" strokeWidth={1.8} />
      {unread > 0 ? (
        <span className="absolute top-0 right-0 flex size-4 items-center justify-center rounded-full bg-[#4a3428] text-[10px] font-medium text-[#fff8f0]">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </Link>
  )
}
