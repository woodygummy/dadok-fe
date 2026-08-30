"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { InquiryImage } from "@/components/inquiry-image"
import { ImagePicker, type PickedImage } from "@/components/image-picker"
import { AuthError } from "@/lib/auth-api"
import {
  fetchInquiry,
  fileToInquiryImage,
  replyInquiry,
  type InquiryDetail,
} from "@/lib/inquiry-api"
import { useDadok } from "@/lib/store"

export default function InquiryThreadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { session } = useDadok()
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null)
  const [error, setError] = useState("")
  const [body, setBody] = useState("")
  const [images, setImages] = useState<PickedImage[]>([])
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!session?.token) return
    fetchInquiry(session.token, id)
      .then(setInquiry)
      .catch((err) => {
        setError(err instanceof AuthError ? err.message : "문의를 불러오지 못했습니다.")
      })
  }, [id, session?.token])

  async function onReply(event: React.FormEvent) {
    event.preventDefault()
    if (!session?.token) return
    setError("")
    setPending(true)
    try {
      const payload = await Promise.all(images.map((item) => fileToInquiryImage(item.file)))
      const next = await replyInquiry(session.token, id, { body: body.trim(), images: payload })
      images.forEach((item) => URL.revokeObjectURL(item.preview))
      setBody("")
      setImages([])
      setInquiry(next)
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "보내지 못했습니다.")
    } finally {
      setPending(false)
    }
  }

  const backHref = session?.user.isAdmin ? "/me/inquiries" : "/me/inquiry"
  const sendLabel = session?.user.isAdmin ? "답변 보내기" : "추가 보내기"

  return (
    <div className="space-y-6">
      <Link href={backHref} className="text-sm text-muted-foreground">
        이전
      </Link>
      <div>
        <h1 className="text-lg font-medium">{session?.user.isAdmin ? "문의 보기" : "내 문의"}</h1>
        {inquiry && session?.user.isAdmin ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {inquiry.fromNickname || inquiry.fromLoginId}
          </p>
        ) : null}
      </div>

      {inquiry?.messages.map((message) => (
        <section key={message.id} className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {message.role === "admin" ? "다독" : inquiry.fromNickname || "나"}
          </p>
          {message.body ? (
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.body}</p>
          ) : null}
          {session && message.attachments.length ? (
            <div className="space-y-2">
              {message.attachments.map((file) => (
                <InquiryImage
                  key={file.id}
                  token={session.token}
                  inquiryId={inquiry.id}
                  file={file}
                />
              ))}
            </div>
          ) : null}
        </section>
      ))}

      {error ? <p className="text-sm text-[var(--destructive)]">{error}</p> : null}

      {session ? (
        <form onSubmit={onReply} className="space-y-3">
          <div className="sketch-frame rounded-[14px]">
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={4000}
              rows={4}
              placeholder={session.user.isAdmin ? "답변을 적어 주세요." : "내용을 더 적어 주세요."}
              className="min-h-[6rem] w-full resize-none bg-transparent px-4 py-3 text-[15px] outline-none"
            />
          </div>
          <ImagePicker images={images} onChange={setImages} />
          <button
            type="submit"
            disabled={pending}
            className="sketch-frame sketch-frame-fill flex h-14 w-full items-center justify-center rounded-[14px] text-[15px] font-medium text-[#FFF8F0] disabled:opacity-60"
          >
            {pending ? "보내는 중…" : sendLabel}
          </button>
        </form>
      ) : null}
    </div>
  )
}
