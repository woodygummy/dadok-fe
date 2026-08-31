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
import { useDadok } from "@/lib/store"
import { BOOK_LIMIT } from "@/lib/types"
import { Plus, X } from "lucide-react"

export function AddBookDialog({
  onAdded,
}: {
  onAdded?: (bookId: string) => void
}) {
  const { books, addBook, removeBook } = useDadok()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchBook[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!open) return
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
  }, [query, open])

  function reset() {
    setQuery("")
    setResults([])
    setError("")
    setMessage("")
    setLoading(false)
  }

  function handleAdd(item: SearchBook) {
    if (books.length >= BOOK_LIMIT) {
      setMessage(`책장은 ${BOOK_LIMIT}권까지만 꽂을 수 있습니다.`)
      return
    }
    const added = addBook({
      googleId: item.id,
      title: item.title,
      authors: item.authors,
      thumbnail: item.thumbnail,
    })
    if (!added) {
      setMessage("이미 책장에 있는 책입니다.")
      return
    }
    setMessage("")
    onAdded?.(added.id)
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
          <Button
            size="icon"
            variant="ghost"
            className="size-10 rounded-full"
            aria-label="책 추가"
          />
        }
      >
        <Plus className="size-6" />
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="sketch-frame overflow-visible rounded-[24px] bg-[var(--niche)] p-5 ring-0 sm:max-w-md"
      >
        <DialogTitle className="sr-only">책 검색</DialogTitle>
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
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        <ul className="no-scrollbar h-[19.5rem] overflow-y-auto">
          {results.map((item, index) => {
            const already = books.some((book) => book.googleId === item.id)
            return (
              <li key={item.id}>
                {index > 0 ? <div className="sketch-line" /> : null}
                <div className="flex items-center gap-2 py-3">
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
                      onClick={() => handleAdd(item)}
                    >
                      추가
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
