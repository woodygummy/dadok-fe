"use client"

import { useState } from "react"
import { AddBookDialog } from "@/components/add-book-dialog"
import { Bookshelf } from "@/components/bookshelf"
import { useDadok } from "@/lib/store"

export default function ShelfPage() {
  const { books } = useDadok()
  const [highlightId, setHighlightId] = useState<string | null>(null)

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">나만의 책장</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {books.length === 0
              ? "아직 꽂힌 책이 없습니다."
              : `${books.length}권이 꽂혀 있습니다.`}
          </p>
        </div>
        <AddBookDialog
          onAdded={(id) => {
            setHighlightId(id)
            window.setTimeout(() => setHighlightId(null), 900)
          }}
        />
      </header>
      <Bookshelf highlightId={highlightId} />
    </div>
  )
}
