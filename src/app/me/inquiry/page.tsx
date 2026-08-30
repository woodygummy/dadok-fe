"use client"

import Link from "next/link"

export default function InquiryPage() {
  return (
    <div className="space-y-6">
      <Link href="/me" className="text-sm text-muted-foreground">
        이전
      </Link>
      <h1 className="text-lg font-medium">문의하기</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        다독 이용 중 불편한 점이나 제안이 있으면 메일로 보내 주세요.
      </p>
      <a
        href="mailto:support@dadok.app?subject=다독 문의"
        className="sketch-frame sketch-frame-fill flex h-14 items-center justify-center rounded-[14px] text-[15px] font-medium text-[#FFF8F0]"
      >
        메일 보내기
      </a>
    </div>
  )
}
