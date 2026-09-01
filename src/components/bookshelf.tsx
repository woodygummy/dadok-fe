"use client"

import { useEffect, useRef, useState } from "react"
import { BookDetailDialog } from "@/components/book-detail-dialog"
import { BookSpine } from "@/components/book-spine"
import { useDadok } from "@/lib/store"
import { BOOK_LIMIT, type Book } from "@/lib/types"
import { cn } from "@/lib/utils"

const COMPACT_ROWS = 3
const MIN_GAP = 4

export function Bookshelf({
  compact = false,
  highlightId,
  showTitles = false,
  onSelectBook,
}: {
  compact?: boolean
  highlightId?: string | null
  showTitles?: boolean
  onSelectBook?: (book: Book) => void
}) {
  const { books } = useDadok()
  const rowRef = useRef<HTMLDivElement>(null)
  const bookWidth = compact ? 28 : 36
  const [booksPerRow, setBooksPerRow] = useState(6)
  const [selected, setSelected] = useState<Book | null>(null)

  useEffect(() => {
    const el = rowRef.current
    if (!el) return

    const measure = () => {
      const width = el.clientWidth
      const count = Math.max(
        1,
        Math.floor((width + MIN_GAP) / (bookWidth + MIN_GAP))
      )
      setBooksPerRow(count)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [bookWidth])

  const slots = compact ? COMPACT_ROWS * booksPerRow : BOOK_LIMIT
  const visible = books.slice(0, slots)
  const rowCount = compact
    ? COMPACT_ROWS
    : Math.max(
        COMPACT_ROWS,
        Math.ceil(Math.max(visible.length, 1) / booksPerRow)
      )
  const rows = Array.from({ length: rowCount }, (_, row) =>
    visible.slice(row * booksPerRow, (row + 1) * booksPerRow)
  )

  return (
    <div className="w-full overflow-visible rounded-[20px] border-4 border-[var(--wood)] bg-[var(--wood-deep)] p-2 shadow-[0_10px_24px_rgba(59,36,20,0.16)]">
      <div className="rounded-[14px] bg-[color-mix(in_srgb,var(--wood)_88%,#2c1c14)] p-2">
        {rows.map((rowBooks, rowIndex) => {
          const filled = rowBooks.length === booksPerRow
          return (
            <div key={rowIndex} className="mb-1 last:mb-0">
              <div
                ref={rowIndex === 0 ? rowRef : undefined}
                className={cn(
                  "rounded-md bg-[var(--niche)] px-0",
                  compact ? "h-16" : "h-24",
                  filled
                    ? "grid items-end"
                    : "flex items-end gap-1"
                )}
                style={
                  filled
                    ? {
                        gridTemplateColumns: `repeat(${booksPerRow}, ${bookWidth}px)`,
                        justifyContent: "space-between",
                      }
                    : undefined
                }
              >
                {rowBooks.length === 0 ? (
                  <p className="w-full pb-2 text-center text-[11px] text-[var(--muted-ink)]/50">
                    {books.length === 0 && rowIndex === 1 ? "빈 책장" : ""}
                  </p>
                ) : (
                  rowBooks.map((book) => (
                    <BookSpine
                      key={book.id}
                      title={book.title}
                      authors={book.authors}
                      thumbnail={book.thumbnail}
                      color={book.spineColor}
                      compact={compact}
                      highlight={highlightId === book.id}
                      showTitle={showTitles}
                      width={bookWidth}
                      onSelect={
                        compact
                          ? undefined
                          : () => {
                              onSelectBook?.(book)
                              setSelected(book)
                            }
                      }
                    />
                  ))
                )}
              </div>
              <div className="h-2 rounded-sm bg-[var(--wood)] shadow-[inset_0_1px_0_rgba(255,248,240,0.2)]" />
            </div>
          )
        })}
      </div>
      {!compact ? (
        <BookDetailDialog
          book={selected}
          open={selected !== null}
          onOpenChange={(next) => {
            if (!next) setSelected(null)
          }}
        />
      ) : null}
    </div>
  )
}
