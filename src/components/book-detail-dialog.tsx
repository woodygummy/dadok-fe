"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { fetchBookDetail, type BookDetail } from "@/lib/api"
import { millieSearchUrl } from "@/lib/book-options"
import { useDadok } from "@/lib/store"
import {
  nextReadingStatus,
  READING_STATUS_LABEL,
  readingStatusOf,
  type Book,
} from "@/lib/types"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

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
  const [review, setReview] = useState("")
  const [ratingDraft, setRatingDraft] = useState<number | null>(null)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [leaveReviewOpen, setLeaveReviewOpen] = useState(false)
  const memoRef = useRef("")
  const reviewRef = useRef("")
  const ratingDraftRef = useRef<number | null>(null)
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
  reviewRef.current = review
  ratingDraftRef.current = ratingDraft

  function isDirty() {
    const current = liveRef.current
    if (!current) return false
    return (
      memoRef.current !== (current.memo ?? "") ||
      reviewRef.current !== (current.review ?? "") ||
      (ratingDraftRef.current ?? null) !== (current.rating ?? null)
    )
  }

  function saveDrafts() {
    const current = liveRef.current
    if (!current) return
    const patch: Partial<Pick<Book, "memo" | "review" | "rating">> = {}
    if (memoRef.current !== (current.memo ?? "")) {
      patch.memo = memoRef.current
    }
    if (reviewRef.current !== (current.review ?? "")) {
      patch.review = reviewRef.current
    }
    if ((ratingDraftRef.current ?? null) !== (current.rating ?? null)) {
      patch.rating = ratingDraftRef.current
    }
    if (Object.keys(patch).length > 0) {
      updateBook(current.id, patch)
    }
  }

  function requestClose() {
    if (isDirty()) {
      setDiscardOpen(true)
      return
    }
    setDiscardOpen(false)
    onOpenChange(false)
  }

  function discardAndClose() {
    setDiscardOpen(false)
    onOpenChange(false)
  }

  function saveAndClose() {
    saveDrafts()
    setDiscardOpen(false)
    onOpenChange(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      if (leaveReviewOpen) {
        setLeaveReviewOpen(false)
        return
      }
      if (discardOpen) {
        setDiscardOpen(false)
        return
      }
      requestClose()
    }
    window.addEventListener("keydown", onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previous
    }
  }, [open, discardOpen, leaveReviewOpen, onOpenChange])

  useEffect(() => {
    if (!open) {
      setMemo("")
      setReview("")
      setRatingDraft(null)
      setDiscardOpen(false)
      setLeaveReviewOpen(false)
      return
    }
    if (!live) return
    setMemo(live.memo ?? "")
    setReview(live.review ?? "")
    setRatingDraft(live.rating ?? null)
    setDiscardOpen(false)
    setLeaveReviewOpen(false)
  }, [open, live?.id])

  if (!mounted || !open || !live) return null

  const title = detail?.title || live.title
  const authors = detail?.authors || live.authors
  const credits = parseAuthorCredits(authors)
  const thumbnail = detail?.thumbnail || live.thumbnail
  const addedAt = formatAddedAt(live.addedAt)
  const selectedCategories = live.categoryIds ?? []
  const status = readingStatusOf(live)
  const rating = ratingDraft ?? 0
  const memoDirty = memo !== (live.memo ?? "")
  const reviewDirty =
    review !== (live.review ?? "") || (ratingDraft ?? null) !== (live.rating ?? null)

  function hasReviewData() {
    return Boolean(reviewRef.current.trim() || (ratingDraftRef.current ?? 0) > 0)
  }

  function cycleStatus() {
    const next = nextReadingStatus(status)
    if (status === "done" && next !== "done" && hasReviewData()) {
      setLeaveReviewOpen(true)
      return
    }
    updateBook(live.id, { readingStatus: next })
  }

  function confirmLeaveReview() {
    const next = nextReadingStatus("done")
    updateBook(live.id, {
      readingStatus: next,
      review: "",
      rating: null,
    })
    setReview("")
    setRatingDraft(null)
    setLeaveReviewOpen(false)
  }

  function saveMemo() {
    if (!memoDirty) return
    updateBook(live.id, { memo })
  }

  function saveReview() {
    if (!reviewDirty) return
    updateBook(live.id, { review, rating: ratingDraft })
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-5 pb-28">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(59,36,20,0.32)]"
        aria-label="닫기"
        onClick={requestClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-detail-title"
        className="no-scrollbar relative z-10 grid max-h-[min(36rem,calc(100vh-7rem))] w-full min-w-0 max-w-md gap-4 overflow-x-hidden overflow-y-auto rounded-[28px] border border-[rgba(92,74,58,0.18)] bg-[var(--card)] p-5 text-left text-sm text-[var(--card-foreground)] shadow-[0_18px_40px_rgba(59,36,20,0.18)]"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-3 right-3 z-10 rounded-full"
          aria-label="닫기"
          onClick={requestClose}
        >
          ✕
        </Button>

        <div className="relative w-full overflow-visible pt-1">
          <div className="relative mx-auto h-52 w-[8.75rem]">
            {thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnail}
                alt=""
                className="h-full w-full rounded-[6px] object-cover shadow-[0_10px_24px_rgba(59,36,20,0.16)]"
              />
            ) : (
              <span className="flex h-full w-full items-end rounded-[6px] bg-[var(--wood)] px-2 pb-2 text-[11px] leading-tight text-[#FFF8F0]">
                {title}
              </span>
            )}
            <button
              type="button"
              className={cn(
                "absolute bottom-0 left-[calc(100%+8px)] whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium",
                status === "unread"
                  ? "bg-[color-mix(in_srgb,var(--wood)_12%,transparent)] text-[var(--foreground)]"
                  : status === "reading"
                    ? "bg-[var(--wood)] text-[#FFF8F0]"
                    : "bg-[var(--terracotta)] text-[#FFF8F0]"
              )}
              aria-label={`읽기 상태 ${READING_STATUS_LABEL[status]}. 누르면 다음 상태로 바뀝니다.`}
              onClick={cycleStatus}
            >
              {READING_STATUS_LABEL[status]}
            </button>
          </div>
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
          <div className="grid gap-1.5">
            <span className="text-base font-medium">카테고리</span>
            <div className="flex flex-wrap gap-1.5">
              {categories.length === 0 ? (
                <span className="rounded-full bg-[color-mix(in_srgb,var(--wood)_12%,transparent)] px-3 py-1.5 text-xs text-muted-foreground">
                  없음
                </span>
              ) : (
                categories.map((category) => {
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
                })
              )}
            </div>
          </div>

          {status === "done" ? (
            <div className="grid gap-1.5">
              <span className="text-base font-medium">감상평</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => {
                  const on = value <= rating
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-label={`${value}점`}
                      aria-pressed={on}
                      className="p-0.5"
                      onClick={() =>
                        setRatingDraft(rating === value ? null : value)
                      }
                    >
                      <Star
                        className="size-6"
                        strokeWidth={1.6}
                        fill={on ? "var(--terracotta)" : "transparent"}
                        color="var(--terracotta)"
                      />
                    </button>
                  )
                })}
              </div>
              <Textarea
                value={review}
                onChange={(event) => setReview(event.target.value)}
                placeholder="이 책을 읽고 남기고 싶은 감상"
                className="no-scrollbar min-h-24 resize-none rounded-[8px] bg-[color-mix(in_srgb,var(--wood)_8%,transparent)]"
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs"
                  disabled={!reviewDirty}
                  onClick={saveReview}
                >
                  저장
                </Button>
              </div>
            </div>
          ) : null}

          <div className="grid gap-1.5">
            <span className="text-base font-medium">메모</span>
            <Textarea
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              placeholder="이 책에 남기고 싶은 말"
              className="no-scrollbar min-h-24 resize-none rounded-[8px] bg-[color-mix(in_srgb,var(--wood)_8%,transparent)]"
            />
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                className="h-8 rounded-full px-3 text-xs"
                disabled={!memoDirty}
                onClick={saveMemo}
              >
                저장
              </Button>
            </div>
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

        <button
          type="button"
          className="py-1 text-center text-base font-medium text-[var(--terracotta)]"
          onClick={() => {
            removeBook(live.id)
            onOpenChange(false)
          }}
        >
          책장에서 빼기
        </button>
      </div>
      {leaveReviewOpen ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
          <button
            type="button"
            className="absolute inset-0 bg-[rgba(59,36,20,0.28)]"
            aria-label="취소"
            onClick={() => setLeaveReviewOpen(false)}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="leave-review-title"
            className="relative z-10 w-full max-w-xs rounded-[24px] bg-[var(--card)] p-5 text-[var(--card-foreground)] shadow-[0_18px_40px_rgba(59,36,20,0.22)]"
          >
            <p id="leave-review-title" className="font-medium">
              책을 아직 덜 읽으셨나요?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              변경 시 감상평이 삭제됩니다.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl"
                onClick={() => setLeaveReviewOpen(false)}
              >
                취소
              </Button>
              <Button
                type="button"
                className="h-11 rounded-2xl"
                onClick={confirmLeaveReview}
              >
                지우기
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {discardOpen ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
          <button
            type="button"
            className="absolute inset-0 bg-[rgba(59,36,20,0.28)]"
            aria-label="취소"
            onClick={() => setDiscardOpen(false)}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="discard-title"
            className="relative z-10 w-full max-w-xs rounded-[24px] bg-[var(--card)] p-5 text-[var(--card-foreground)] shadow-[0_18px_40px_rgba(59,36,20,0.22)]"
          >
            <p id="discard-title" className="font-medium">
              저장하시겠습니까?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              저장하지 않으면 변경 내용이 사라집니다.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl"
                onClick={discardAndClose}
              >
                저장 안 함
              </Button>
              <Button
                type="button"
                className="h-11 rounded-2xl"
                onClick={saveAndClose}
              >
                저장
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>,
    document.body
  )
}
