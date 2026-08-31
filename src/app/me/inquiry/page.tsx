"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, ChevronRight } from "lucide-react"
import { BackLink } from "@/components/back-link"
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
      <BackLink href="/me" />
      <h1 className="text-lg font-medium">문의하기</h1>
      {error ? <p className="text-sm text-[var(--destructive)]">{error}</p> : null}
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">아직 보낸 문의가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/me/inquiry/${item.id}`}
                className="sketch-frame flex items-center rounded-[18px] bg-[var(--niche)]"
              >
                <span className="min-w-0 flex-1 px-5 py-3.5">
                  <span className="flex gap-2 text-[15px]">
                    <span className="shrink-0 font-medium">문의</span>
                    <span className="min-w-0 truncate text-muted-foreground">
                      {item.question || item.preview}
                    </span>
                  </span>
                </span>
                {item.hasReply ? (
                  <span className="shrink-0 px-4 text-[13px] text-[#3b2414]">답변 보기</span>
                ) : (
                  <ChevronRight className="mx-4 size-4 shrink-0 text-[#8a7a6c]" strokeWidth={2} />
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/me/inquiry/new"
        aria-label="문의하기"
        className="fixed right-6 bottom-24 z-40 flex size-14 items-center justify-center rounded-full bg-[#3b2414] text-[#fff8f0] shadow-[0_10px_24px_rgba(59,36,20,0.22)]"
      >
        <Pencil className="size-5" strokeWidth={2} />
      </Link>
    </div>
  )
}
