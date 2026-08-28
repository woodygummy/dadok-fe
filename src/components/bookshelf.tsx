"use client"

import { useEffect, useRef, useState } from "react"
import { useDadok } from "@/lib/store"
import { BOOK_LIMIT } from "@/lib/types"
import { cn } from "@/lib/utils"

const COMPACT_ROWS = 3
const MIN_GAP = 4

export function Bookshelf({
  compact = false,
  highlightId,
}: {
  compact?: boolean
  highlightId?: string | null
}) {
  const { books } = useDadok()
  const rowRef = useRef<HTMLDivElement>(null)
  const bookWidth = compact ? 28 : 36
  const [booksPerRow, setBooksPerRow] = useState(6)

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
    <div className="w-full overflow-hidden rounded-[20px] border-4 border-[var(--wood)] bg-[var(--wood-deep)] p-2 shadow-[0_10px_24px_rgba(59,36,20,0.16)]">
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
                    <div
                      key={book.id}
                      className={cn(
                        "relative origin-bottom overflow-hidden rounded-[3px] border border-[rgba(59,36,20,0.35)] bg-[var(--terracotta)] shadow-[2px_2px_0_rgba(59,36,20,0.18)]",
                        compact ? "h-12" : "h-[4.6rem]",
                        highlightId === book.id && "animate-shelf-in"
                      )}
                      style={{ width: bookWidth, flex: "0 0 auto" }}
                      title={`${book.title} · ${book.authors}`}
                    >
                      {book.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={book.thumbnail}
                          alt={book.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="block h-full w-full bg-[linear-gradient(90deg,#c45c26,#7a8f72,#c4785a)]" />
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="h-2 rounded-sm bg-[var(--wood)] shadow-[inset_0_1px_0_rgba(255,248,240,0.2)]" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
