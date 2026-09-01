"use client"

import { useEffect, useState } from "react"
import { SketchFrame } from "@/components/sketch-stroke"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { searchBooks, type SearchBook } from "@/lib/api"
import {
  BOOK_SPINE_PALETTE,
  pickRandomSpineColor,
} from "@/lib/book-options"
import { useDadok } from "@/lib/store"
import { BOOK_LIMIT } from "@/lib/types"
import { ChevronLeft, Shuffle, X } from "lucide-react"

export function AddBookDialog({
  onAdded,
  categoryId,
}: {
  onAdded?: (bookId: string) => void
  categoryId?: string | null
}) {
  const { books, addBook, removeBook } = useDadok()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchBook[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [picked, setPicked] = useState<SearchBook | null>(null)
  const [colorMode, setColorMode] = useState<"random" | "palette">("random")
  const [spineColor, setSpineColor] = useState(() => pickRandomSpineColor())
  const [fromMillie, setFromMillie] = useState(false)

  useEffect(() => {
    if (!open || picked) return
    const q = query.trim()
    const delay = q ? 180 : 0

    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError("")
      try {
        const next = await searchBooks(q)
        setResults(next)
        if (q && next.length === 0) setError("검색 결과가 없습니다.")
      } catch {
        setResults([])
        setError("책 검색에 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }, delay)

    return () => window.clearTimeout(timer)
  }, [query, open, picked])

  function reset() {
    setQuery("")
    setResults([])
    setError("")
    setMessage("")
    setLoading(false)
    setPicked(null)
    setColorMode("random")
    setSpineColor(pickRandomSpineColor())
    setFromMillie(false)
  }

  function openPicker(item: SearchBook) {
    if (books.length >= BOOK_LIMIT) {
      setMessage(`책장은 ${BOOK_LIMIT}권까지만 꽂을 수 있습니다.`)
      return
    }
    setMessage("")
    setPicked(item)
    setColorMode("random")
    setSpineColor(pickRandomSpineColor())
    setFromMillie(false)
  }

  function addSearchBook(
    item: SearchBook,
    options: { spineColor: string; fromMillie: boolean },
  ) {
    if (books.length >= BOOK_LIMIT) {
      setMessage(`책장은 ${BOOK_LIMIT}권까지만 꽂을 수 있습니다.`)
      return
    }
    const added = addBook({
      googleId: item.id,
      title: item.title,
      authors: item.authors,
      thumbnail: item.thumbnail,
      spineColor: options.spineColor,
      fromMillie: options.fromMillie,
      categoryIds: categoryId ? [categoryId] : [],
    })
    if (!added) {
      setMessage("이미 책장에 있는 책입니다.")
      setPicked(null)
      return
    }
    setOpen(false)
    onAdded?.(added.id)
  }

  function handleQuickAdd(item: SearchBook) {
    addSearchBook(item, {
      spineColor: pickRandomSpineColor(),
      fromMillie: false,
    })
  }

  function handleAdd() {
    if (!picked) return
    addSearchBook(picked, { spineColor, fromMillie })
  }

  function handleRemove(item: SearchBook) {
    const stored = books.find((book) => book.googleId === item.id)
    if (!stored) return
    removeBook(stored.id)
    setMessage("")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger
        render={
          <button
            type="button"
            className="shrink-0 bg-transparent p-0 text-sm font-medium"
          />
        }
      >
        책 추가
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-[min(28rem,calc(100%-2rem))] overflow-visible border-0 bg-transparent p-4 shadow-none ring-0 sm:max-w-md"
      >
        <div className="sketch-frame min-w-0 overflow-visible rounded-[24px] bg-[var(--niche)] p-5">
        <DialogTitle className="sr-only">
          {picked ? "책 꽂기" : "책 검색"}
        </DialogTitle>
        <div className="min-w-0">
        {picked ? (
          <div className="min-w-0 space-y-4">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                className="flex size-10 shrink-0 items-center justify-center text-[var(--sketch-stroke)]"
                aria-label="검색으로 돌아가기"
                onClick={() => setPicked(null)}
              >
                <ChevronLeft className="size-5" strokeWidth={2} />
              </button>
              <p className="min-w-0 flex-1 truncate text-sm font-medium">
                {picked.title}
              </p>
              <DialogClose
                render={
                  <button
                    type="button"
                    className="flex size-10 shrink-0 items-center justify-center text-[var(--sketch-stroke)]"
                    aria-label="닫기"
                  />
                }
              >
                <X className="size-5" strokeWidth={2} />
              </DialogClose>
            </div>

            <div className="flex min-w-0 items-center gap-3">
              {picked.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={picked.thumbnail}
                  alt=""
                  className="h-20 w-14 shrink-0 rounded object-cover"
                />
              ) : (
                <span className="h-20 w-14 shrink-0 rounded bg-[var(--wood)]" />
              )}
              <div className="min-w-0 flex-1">
                <p className="wrap-break-word font-medium leading-snug">
                  {picked.title}
                </p>
                <p className="wrap-break-word text-xs text-muted-foreground">
                  {picked.authors}
                </p>
                <span
                  className="mt-2 inline-block h-7 w-4 rounded-[2px] shadow-[inset_-3px_0_6px_rgba(44,28,20,0.28)]"
                  style={{ backgroundColor: spineColor }}
                  aria-hidden
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">책등 색</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-xs ${
                    colorMode === "random"
                      ? "bg-[var(--wood)] text-[#FFF8F0]"
                      : "bg-[color-mix(in_srgb,var(--wood)_12%,transparent)] text-[var(--foreground)]"
                  }`}
                  onClick={() => {
                    setColorMode("random")
                    setSpineColor((current) => pickRandomSpineColor(current))
                  }}
                >
                  <Shuffle className="size-3.5" />
                  랜덤
                </button>
                {BOOK_SPINE_PALETTE.map((color) => {
                  const selected =
                    colorMode === "palette" && spineColor === color
                  return (
                    <button
                      key={color}
                      type="button"
                      aria-label={`색상 ${color}`}
                      aria-pressed={selected}
                      className="size-8 rounded-full"
                      style={{
                        backgroundColor: color,
                        boxShadow: selected
                          ? "0 0 0 2px var(--niche), 0 0 0 4px var(--sketch-stroke)"
                          : "inset 0 0 0 1px rgba(59,36,20,0.18)",
                      }}
                      onClick={() => {
                        setColorMode("palette")
                        setSpineColor(color)
                      }}
                    />
                  )
                })}
              </div>
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[16px] bg-[color-mix(in_srgb,var(--wood)_10%,transparent)] px-4 py-3 text-sm">
              <span>밀리의 서재에서 읽어요</span>
              <input
                type="checkbox"
                checked={fromMillie}
                onChange={(event) => setFromMillie(event.target.checked)}
                className="size-4 accent-[var(--wood)]"
              />
            </label>

            <Button
              type="button"
              className="h-12 w-full rounded-3xl"
              disabled={books.length >= BOOK_LIMIT}
              onClick={handleAdd}
            >
              책장에 꽂기
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <SketchFrame className="min-w-0 flex-1 rounded-[16px]">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onInput={(event) => {
                    const value = (event.target as HTMLInputElement).value
                    setQuery(value)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.preventDefault()
                  }}
                  placeholder="제목 또는 저자 검색"
                  autoFocus
                  className="h-12 rounded-[16px] border-0 bg-transparent px-4 shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
                />
              </SketchFrame>
              <DialogClose
                render={
                  <button
                    type="button"
                    className="flex size-10 shrink-0 items-center justify-center text-[var(--sketch-stroke)]"
                    aria-label="닫기"
                  />
                }
              >
                <X className="size-5" strokeWidth={2} />
              </DialogClose>
            </div>
            {loading ? (
              <p className="text-sm text-muted-foreground">검색 중…</p>
            ) : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? (
              <p className="text-sm text-muted-foreground">{message}</p>
            ) : null}
            <ul className="no-scrollbar h-[19.5rem] min-w-0 overflow-x-hidden overflow-y-auto">
              {results.map((item, index) => {
                const already = books.some((book) => book.googleId === item.id)
                return (
                  <li key={item.id} className="min-w-0">
                    {index > 0 ? <div className="sketch-line" /> : null}
                    <div className="flex min-w-0 items-center gap-2 py-3">
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-left"
                        disabled={already}
                        onClick={() => openPicker(item)}
                      >
                        {item.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.thumbnail}
                            alt=""
                            className="h-14 w-10 shrink-0 rounded object-cover"
                          />
                        ) : (
                          <span className="h-14 w-10 shrink-0 rounded bg-[var(--wood)]" />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {item.title}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {item.authors}
                          </span>
                        </span>
                      </button>
                      {already ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          onClick={() => handleRemove(item)}
                        >
                          빼기
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          className="shrink-0"
                          disabled={books.length >= BOOK_LIMIT}
                          onClick={(event) => {
                            event.stopPropagation()
                            handleQuickAdd(item)
                          }}
                        >
                          추가
                        </Button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
