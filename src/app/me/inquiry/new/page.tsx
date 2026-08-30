"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { BackLink } from "@/components/back-link"
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
      <BackLink href="/me/inquiry" />
      <h1 className="text-lg font-medium">문의하기</h1>
      <InquiryCompose token={session.token} onSent={(id) => router.replace(`/me/inquiry/${id}`)} />
    </div>
  )
}
