"use client"

import { useState } from "react"
import { ImagePicker, type PickedImage } from "@/components/image-picker"
import { SketchFrame } from "@/components/sketch-stroke"
import { AuthError } from "@/lib/auth-api"
import { createInquiry, fileToInquiryImage } from "@/lib/inquiry-api"

export function InquiryCompose({
  token,
  onSent,
}: {
  token: string
  onSent: (id: string) => void
}) {
  const [body, setBody] = useState("")
  const [images, setImages] = useState<PickedImage[]>([])
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    setPending(true)
    try {
      const payload = await Promise.all(images.map((item) => fileToInquiryImage(item.file)))
      const inquiry = await createInquiry(token, { body: body.trim(), images: payload })
      images.forEach((item) => URL.revokeObjectURL(item.preview))
      setBody("")
      setImages([])
      onSent(inquiry.id)
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "문의를 보내지 못했습니다.")
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <SketchFrame className="rounded-[14px]">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={4000}
          rows={5}
          placeholder="불편한 점이나 제안, 오류가 난 상황을 적어 주세요."
          className="min-h-[8rem] w-full resize-none bg-transparent px-4 py-3 text-[15px] outline-none"
        />
      </SketchFrame>
      <ImagePicker images={images} onChange={setImages} />
      {error ? <p className="text-sm text-[var(--destructive)]">{error}</p> : null}
      <SketchFrame className="h-14 w-full rounded-[14px]">
        <button
          type="submit"
          disabled={pending}
          className="sketch-frame-fill flex h-full w-full items-center justify-center text-[15px] font-medium text-[#FFF8F0] disabled:opacity-60"
        >
          {pending ? "보내는 중…" : "보내기"}
        </button>
      </SketchFrame>
    </form>
  )
}
