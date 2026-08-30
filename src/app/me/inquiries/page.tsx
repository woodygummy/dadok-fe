"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BackLink } from "@/components/back-link"
import { AuthError } from "@/lib/auth-api"
import { fetchInquiries, type InquirySummary } from "@/lib/inquiry-api"
import { useDadok } from "@/lib/store"

export default function InquiriesInboxPage() {
  const { session } = useDadok()
  const router = useRouter()
  const [items, setItems] = useState<InquirySummary[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    if (session && !session.user.isAdmin) {
      router.replace("/me/inquiry")
      return
    }
    if (!session?.token) return
    fetchInquiries(session.token)
      .then(setItems)
      .catch((err) => {
        setError(err instanceof AuthError ? err.message : "문의를 불러오지 못했습니다.")
      })
  }, [router, session])

  if (!session?.user.isAdmin) return null

  return (
    <div className="space-y-6">
      <BackLink href="/me" />
      <h1 className="text-lg font-medium">문의 사항</h1>
      {error ? <p className="text-sm text-[var(--destructive)]">{error}</p> : null}
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">아직 들어온 문의가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/me/inquiry/${item.id}`}
                className="sketch-frame flex items-center overflow-hidden rounded-[18px] bg-[var(--niche)]"
              >
                <span className="min-w-0 flex-1 px-5 py-3.5">
                  <span className="block text-xs text-muted-foreground">
                    {item.fromNickname || item.fromLoginId}
                    {item.unread ? " · 새 문의" : ""}
                  </span>
                  <span className="mt-1 flex gap-2 text-[15px]">
                    <span className="shrink-0 font-medium">문의</span>
                    <span className="min-w-0 truncate text-muted-foreground">
                      {item.question || item.preview}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 px-4 text-[13px] text-[#3b2414]">
                  {item.hasReply ? "답변 보기" : "답변하기"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
