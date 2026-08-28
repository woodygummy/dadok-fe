"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { fetchBookDetail, type BookDetail } from "@/lib/api"
import { useDadok } from "@/lib/store"
import type { Book } from "@/lib/types"

function formatAddedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function BookDetailDialog({
  book,
  open,
  onOpenChange,
}: {
  book: Book | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { removeBook } = useDadok()
  const [mounted, setMounted] = useState(false)
  const [detail, setDetail] = useState<BookDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previous
    }
  }, [open, onOpenChange])

  useEffect(() => {
    if (!open || !book) {
      setDetail(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setDetail(null)

    fetchBookDetail(book.googleId)
      .then((next) => {
        if (!cancelled) setDetail(next)
      })
      .catch(() => {
        if (!cancelled) setDetail(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [book, open])

  if (!mounted || !open || !book) return null

  const title = detail?.title || book.title
  const authors = detail?.authors || book.authors
  const thumbnail = detail?.thumbnail || book.thumbnail
  const addedAt = formatAddedAt(book.addedAt)

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-5">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(59,36,20,0.32)]"
        aria-label="닫기"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-detail-title"
        className="relative z-10 grid max-h-[min(36rem,calc(100vh-4rem))] w-full max-w-md gap-4 overflow-y-auto rounded-[28px] border border-[rgba(92,74,58,0.18)] bg-[var(--card)] p-5 text-sm text-[var(--card-foreground)] shadow-[0_18px_40px_rgba(59,36,20,0.18)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              id="book-detail-title"
              className="font-serif text-[22px] leading-snug font-semibold tracking-tight"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{authors}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 rounded-full"
            aria-label="닫기"
            onClick={() => onOpenChange(false)}
          >
            ✕
          </Button>
        </div>

        <div className="flex gap-4">
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
              alt=""
              className="h-40 w-[6.75rem] shrink-0 rounded-xl object-cover shadow-[0_10px_24px_rgba(59,36,20,0.16)]"
            />
          ) : (
            <span className="flex h-40 w-[6.75rem] shrink-0 items-end rounded-xl bg-[var(--wood)] px-2 pb-2 text-[11px] leading-tight text-[#FFF8F0]">
              {title}
            </span>
          )}
          <dl className="min-w-0 flex-1 space-y-2 text-sm">
            {detail?.publisher ? (
              <div>
                <dt className="text-xs text-muted-foreground">출판사</dt>
                <dd>{detail.publisher}</dd>
              </div>
            ) : null}
            {detail?.pubDate ? (
              <div>
                <dt className="text-xs text-muted-foreground">출간</dt>
                <dd>{detail.pubDate}</dd>
              </div>
            ) : null}
            {detail?.category ? (
              <div>
                <dt className="text-xs text-muted-foreground">분류</dt>
                <dd className="leading-snug">{detail.category}</dd>
              </div>
            ) : null}
            {addedAt ? (
              <div>
                <dt className="text-xs text-muted-foreground">책장에 꽂은 날</dt>
                <dd>{addedAt}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">소개를 불러오는 중…</p>
        ) : detail?.description ? (
          <p className="whitespace-pre-wrap font-serif text-[15px] leading-[1.65] text-[var(--muted-ink)]">
            {detail.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">소개글이 없습니다.</p>
        )}

        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-3xl border-[rgba(166,61,31,0.35)] text-[var(--terracotta)]"
          onClick={() => {
            removeBook(book.id)
            onOpenChange(false)
          }}
        >
          책장에서 빼기
        </Button>
      </div>
    </div>,
    document.body
  )
}
