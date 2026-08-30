"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { AuthError } from "@/lib/auth-api"
import { fetchInquiries, type InquirySummary } from "@/lib/inquiry-api"
import { useDadok } from "@/lib/store"

export default function AlertsPage() {
  const { session } = useDadok()
  const [items, setItems] = useState<InquirySummary[]>([])
  const [error, setError] = useState("")
  const isAdmin = Boolean(session?.user.isAdmin)

  useEffect(() => {
    if (!session?.token) return
    fetchInquiries(session.token)
      .then((rows) => setItems(rows.filter((row) => row.unread)))
      .catch((err) => {
        setError(err instanceof AuthError ? err.message : "알림을 불러오지 못했습니다.")
      })
  }, [session?.token])

  return (
    <div className="space-y-6">
      <Link href="/me" className="text-sm text-muted-foreground">
        이전
      </Link>
      <h1 className="text-lg font-medium">알림</h1>
      {error ? <p className="text-sm text-[var(--destructive)]">{error}</p> : null}
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">새 알림이 없습니다.</p>
      ) : (
        <ul className="sketch-frame overflow-hidden rounded-[18px] bg-[var(--niche)]">
          {items.map((item, index) => (
            <li key={item.id}>
              {index > 0 ? <div className="sketch-line mx-4" /> : null}
              <Link
                href={`/me/inquiry/${item.id}`}
                className="flex items-center justify-between gap-3 px-5 py-[0.95rem]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-medium">
                    {isAdmin ? "새 문의" : "답변이 달렸습니다"}
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">{item.preview}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-[#8a7a6c]" strokeWidth={2} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
