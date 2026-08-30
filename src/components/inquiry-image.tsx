"use client"

import { useEffect, useState } from "react"
import { fetchInquiryImage, type InquiryAttachment } from "@/lib/inquiry-api"

export function InquiryImage({
  token,
  inquiryId,
  file,
}: {
  token: string
  inquiryId: string
  file: InquiryAttachment
}) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let url: string | null = null
    let cancelled = false
    fetchInquiryImage(token, inquiryId, file.id)
      .then((next) => {
        if (cancelled) {
          URL.revokeObjectURL(next)
          return
        }
        url = next
        setSrc(next)
      })
      .catch(() => {
        if (!cancelled) setSrc(null)
      })
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [file.id, inquiryId, token])

  if (!src) {
    return (
      <div className="flex h-28 items-center justify-center rounded-xl bg-[#d8d4cf] text-xs text-muted-foreground">
        이미지
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={file.name} className="max-h-56 w-full rounded-xl object-cover" />
  )
}
