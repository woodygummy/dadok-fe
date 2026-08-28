"use client"

import { useDadok } from "@/lib/store"
import { BOOK_LIMIT } from "@/lib/types"
import { cn } from "@/lib/utils"

const BOOKS_PER_ROW = 6
const COMPACT_ROWS = 3

export function Bookshelf({
  compact = false,
  highlightId,
}: {
  compact?: boolean
  highlightId?: string | null
}) {
  const { books } = useDadok()
  const slots = compact ? COMPACT_ROWS * BOOKS_PER_ROW : BOOK_LIMIT
  const visible = books.slice(0, slots)
  const rowCount = compact
    ? COMPACT_ROWS
    : Math.max(COMPACT_ROWS, Math.ceil(Math.max(visible.length, 1) / BOOKS_PER_ROW))
  const rows = Array.from({ length: rowCount }, (_, row) =>
    visible.slice(row * BOOKS_PER_ROW, (row + 1) * BOOKS_PER_ROW)
  )

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] border-4 border-[var(--wood)] bg-[var(--wood-deep)] p-2 shadow-[0_10px_24px_rgba(59,36,20,0.16)]",
        compact ? "w-full" : "w-full"
      )}
    >
      <div className="rounded-[14px] bg-[color-mix(in_srgb,var(--wood)_88%,#2c1c14)] p-2">
        {rows.map((rowBooks, rowIndex) => (
          <div key={rowIndex} className="mb-1 last:mb-0">
            <div
              className={cn(
                "flex items-end gap-1 rounded-md bg-[var(--niche)] px-2",
                compact ? "h-16" : "h-24"
              )}
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
                      compact ? "h-12 w-7" : "h-[4.6rem] w-9",
                      highlightId === book.id && "animate-shelf-in"
                    )}
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
        ))}
      </div>
    </div>
  )
}
