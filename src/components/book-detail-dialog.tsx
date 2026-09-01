"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { fetchBookDetail, type BookDetail } from "@/lib/api"
import { millieSearchUrl } from "@/lib/book-options"
import { useDadok } from "@/lib/store"
import type { Book } from "@/lib/types"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

function formatAddedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function parseAuthorCredits(raw: string) {
  const cleaned = raw.trim()
  if (!cleaned || cleaned === "저자 미상") return []

  const chunks = cleaned
    .split(/\s*,\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
  const credits: { role: string; name: string }[] = []
  let pendingNames: string[] = []

  for (const chunk of chunks) {
    const match = chunk.match(/^(.*?)\s*\(([^)]+)\)\s*$/)
    if (match) {
      const name = match[1].trim()
      const role = match[2].trim()
      const names = [...pendingNames, name].filter(Boolean)
      pendingNames = []
      for (const person of names) {
        credits.push({ role, name: person })
      }
    } else {
      pendingNames.push(chunk)
    }
  }

  for (const name of pendingNames) {
    credits.push({ role: "지은이", name })
  }

  return credits
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
  const { books, categories, removeBook, updateBook } = useDadok()
  const [mounted, setMounted] = useState(false)
  const [detail, setDetail] = useState<BookDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [memo, setMemo] = useState("")
  const memoRef = useRef("")
  const liveRef = useRef<Book | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const live = book
    ? (books.find((item) => item.id === book.id) ?? book)
    : null
  liveRef.current = live
  memoRef.current = memo

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      const current = liveRef.current
      if (current && memoRef.current !== (current.memo ?? "")) {
        updateBook(current.id, { memo: memoRef.current })
      }
      onOpenChange(false)
    }
    window.addEventListener("keydown", onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previous
    }
  }, [open, onOpenChange, updateBook])

  useEffect(() => {
    setMemo(live?.memo ?? "")
  }, [live?.id, live?.memo])

  if (!mounted || !open || !live) return null

  const title = detail?.title || live.title
  const authors = detail?.authors || live.authors
  const credits = parseAuthorCredits(authors)
  const thumbnail = detail?.thumbnail || live.thumbnail
  const addedAt = formatAddedAt(live.addedAt)
  const selectedCategories = live.categoryIds ?? []

  function persistMemo() {
    if (memo !== (live.memo ?? "")) {
      updateBook(live.id, { memo })
    }
  }

  function close() {
    persistMemo()
    onOpenChange(false)
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-5 pb-28">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(59,36,20,0.32)]"
        aria-label="닫기"
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-detail-title"
        className="relative z-10 grid max-h-[min(36rem,calc(100vh-7rem))] w-full min-w-0 max-w-md gap-4 overflow-x-hidden overflow-y-auto rounded-[28px] border border-[rgba(92,74,58,0.18)] bg-[var(--card)] p-5 text-left text-sm text-[var(--card-foreground)] shadow-[0_18px_40px_rgba(59,36,20,0.18)]"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-3 right-3 z-10 rounded-full"
          aria-label="닫기"
          onClick={close}
        >
          ✕
        </Button>

        <div className="flex justify-center pt-1">
          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
              alt=""
              className="h-52 w-[8.75rem] rounded-xl object-cover shadow-[0_10px_24px_rgba(59,36,20,0.16)]"
            />
          ) : (
            <span className="flex h-52 w-[8.75rem] items-end rounded-xl bg-[var(--wood)] px-2 pb-2 text-[11px] leading-tight text-[#FFF8F0]">
              {title}
            </span>
          )}
        </div>

        <h2
          id="book-detail-title"
          className="min-w-0 pr-8 font-serif text-[22px] leading-snug font-semibold tracking-tight wrap-break-word"
        >
          {title}
        </h2>

        {loading ? (
          <p className="text-sm text-muted-foreground">소개를 불러오는 중…</p>
        ) : detail?.description ? (
          <p className="whitespace-pre-wrap font-serif text-[15px] leading-[1.65] text-[var(--muted-ink)]">
            {detail.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">소개글이 없습니다.</p>
        )}

        <ul className="space-y-0.5 text-right text-sm text-muted-foreground">
          {credits.length > 0
            ? credits.map((credit) => (
                <li key={`${credit.role}-${credit.name}`}>
                  {credit.role} {credit.name}
                </li>
              ))
            : authors
              ? <li>{authors}</li>
              : null}
          {addedAt ? <li>책장에 꽂은 날 {addedAt}</li> : null}
        </ul>

        <div className="grid gap-3">
          <button
            type="button"
            className={cn(
              "h-10 rounded-full text-sm",
              live.reading
                ? "bg-[var(--wood)] text-[#FFF8F0]"
                : "bg-[color-mix(in_srgb,var(--wood)_12%,transparent)]"
            )}
            onClick={() => updateBook(live.id, { reading: !live.reading })}
          >
            읽는중
          </button>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium">메모</span>
            <Textarea
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              onBlur={persistMemo}
              placeholder="이 책에 남기고 싶은 말"
              className="min-h-24 rounded-2xl bg-[color-mix(in_srgb,var(--wood)_8%,transparent)]"
            />
          </label>

          <div className="grid gap-1.5">
            <span className="text-sm font-medium">카테고리</span>
            {categories.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                책장 왼쪽 위 + 로 칸을 만들 수 있어요. 예: 추천 받은 책
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {categories.map((category) => {
                  const on = selectedCategories.includes(category.id)
                  return (
                    <button
                      key={category.id}
                      type="button"
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs",
                        on
                          ? "bg-[var(--wood)] text-[#FFF8F0]"
                          : "bg-[color-mix(in_srgb,var(--wood)_12%,transparent)]"
                      )}
                      onClick={() => {
                        const next = on
                          ? selectedCategories.filter((id) => id !== category.id)
                          : [...selectedCategories, category.id]
                        updateBook(live.id, { categoryIds: next })
                      }}
                    >
                      {category.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {live.fromMillie ? (
          <a
            href={millieSearchUrl(title)}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 items-center justify-center rounded-3xl bg-[var(--wood)] text-sm font-medium text-[#FFF8F0]"
          >
            밀리의 서재 바로가기
          </a>
        ) : null}

        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-3xl border-[rgba(166,61,31,0.35)] text-[var(--terracotta)]"
          onClick={() => {
            removeBook(live.id)
            onOpenChange(false)
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
