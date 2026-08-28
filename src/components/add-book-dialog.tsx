"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { searchBooks, type SearchBook } from "@/lib/api"
import { useDadok } from "@/lib/store"
import { BOOK_LIMIT } from "@/lib/types"
import { Plus } from "lucide-react"

export function AddBookDialog({
  onAdded,
}: {
  onAdded?: (bookId: string) => void
}) {
  const { books, addBook } = useDadok()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchBook[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!open) return
    const q = query.trim()
    if (!q) {
      setResults([])
      setError("")
      setLoading(false)
      return
    }

    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError("")
      try {
        const next = await searchBooks(q)
        setResults(next)
        if (next.length === 0) setError("검색 결과가 없습니다.")
      } catch {
        setResults([])
        setError("Google Books 검색에 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }, 350)

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
    onAdded?.(added.id)
    reset()
    setOpen(false)
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
            disabled={books.length >= BOOK_LIMIT}
          />
        }
      >
        <Plus className="size-6" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>책 검색해서 꽂기</DialogTitle>
          <DialogDescription>
            Google Books에서 제목이나 저자를 검색한 뒤 책장에 넣습니다.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="책 제목 또는 저자"
          autoFocus
        />
        {loading ? (
          <p className="text-sm text-muted-foreground">검색 중…</p>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        <ul className="max-h-72 space-y-2 overflow-y-auto">
          {results.map((item) => {
            const already = books.some((book) => book.googleId === item.id)
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleAdd(item)}
                  disabled={already}
                  className="flex w-full items-center gap-3 rounded-xl bg-muted/60 p-2 text-left disabled:opacity-50"
                >
                  {item.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="h-14 w-10 rounded object-cover"
                    />
                  ) : (
                    <span className="h-14 w-10 rounded bg-[var(--wood)]" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {item.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.authors}
                    </span>
                    {already ? (
                      <span className="text-xs text-muted-foreground">
                        이미 꽂혀 있음
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
