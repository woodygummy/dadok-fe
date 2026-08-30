"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { InquiryCompose } from "@/components/inquiry-compose"
import { useDadok } from "@/lib/store"

export default function NewInquiryPage() {
  const { session } = useDadok()
  const router = useRouter()

  useEffect(() => {
    if (session?.user.isAdmin) router.replace("/me/inquiries")
  }, [router, session])

  if (!session || session.user.isAdmin) return null

  return (
    <div className="space-y-6">
      <Link href="/me/inquiry" className="text-sm text-muted-foreground">
        이전
      </Link>
      <h1 className="text-lg font-medium">문의하기</h1>
      <InquiryCompose token={session.token} onSent={(id) => router.replace(`/me/inquiry/${id}`)} />
    </div>
  )
}
