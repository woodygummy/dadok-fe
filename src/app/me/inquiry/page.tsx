"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { InquiryCompose } from "@/components/inquiry-compose"
import { AuthError } from "@/lib/auth-api"
import { fetchInquiries, type InquirySummary } from "@/lib/inquiry-api"
import { useDadok } from "@/lib/store"

export default function InquiryPage() {
  const { session } = useDadok()
  const router = useRouter()
  const [items, setItems] = useState<InquirySummary[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    if (session?.user.isAdmin) {
      router.replace("/me/inquiries")
      return
    }
    if (!session?.token) return
    fetchInquiries(session.token)
      .then(setItems)
      .catch((err) => {
        setError(err instanceof AuthError ? err.message : "문의를 불러오지 못했습니다.")
      })
  }, [router, session])

  if (!session || session.user.isAdmin) return null

  return (
    <div className="space-y-6">
      <Link href="/me" className="text-sm text-muted-foreground">
        이전
      </Link>
      <h1 className="text-lg font-medium">문의 사항</h1>
      <InquiryCompose
        token={session.token}
        onSent={(id) => router.push(`/me/inquiry/${id}`)}
      />
      {error ? <p className="text-sm text-[var(--destructive)]">{error}</p> : null}
      {items.length ? (
        <div className="space-y-2">
          <h2 className="text-sm text-muted-foreground">보낸 문의</h2>
          <ul className="sketch-frame overflow-hidden rounded-[18px] bg-[var(--niche)]">
            {items.map((item, index) => (
              <li key={item.id}>
                {index > 0 ? <div className="sketch-line mx-4" /> : null}
                <Link
                  href={`/me/inquiry/${item.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-[0.95rem]"
                >
                  <span className="min-w-0 truncate text-[15px] font-medium">
                    {item.unread ? "답변 있음 · " : ""}
                    {item.preview}
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-[#8a7a6c]" strokeWidth={2} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
