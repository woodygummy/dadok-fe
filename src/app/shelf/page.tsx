"use client"

import { useState } from "react"
import { AddBookDialog } from "@/components/add-book-dialog"
import { Bookshelf } from "@/components/bookshelf"
import { useDadok } from "@/lib/store"
import { BOOK_LIMIT } from "@/lib/types"

export default function ShelfPage() {
  const { books } = useDadok()
  const [highlightId, setHighlightId] = useState<string | null>(null)

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">나만의 책장</h1>
        <AddBookDialog
          onAdded={(id) => {
            setHighlightId(id)
            window.setTimeout(() => setHighlightId(null), 900)
          }}
        />
      </header>
      <div>
        <p className="mb-1 text-right text-sm tabular-nums text-muted-foreground">
          {books.length}/{BOOK_LIMIT}
        </p>
        <Bookshelf highlightId={highlightId} />
      </div>
    </div>
  )
}
