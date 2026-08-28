"use client"

import { useState } from "react"
import { AddBookDialog } from "@/components/add-book-dialog"
import { Bookshelf } from "@/components/bookshelf"
import { Button } from "@/components/ui/button"
import { useDadok } from "@/lib/store"
import { BOOK_LIMIT } from "@/lib/types"

export default function ShelfPage() {
  const { books } = useDadok()
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [showTitles, setShowTitles] = useState(false)

  return (
    <div className="space-y-5">
      <header className="flex justify-end">
        <AddBookDialog
          onAdded={(id) => {
            setHighlightId(id)
            window.setTimeout(() => setHighlightId(null), 900)
          }}
        />
      </header>
      <div>
        <div className="mb-1 flex justify-end">
          <Button
            type="button"
            size="sm"
            variant={showTitles ? "default" : "outline"}
            onClick={() => setShowTitles((value) => !value)}
          >
            책제목
          </Button>
        </div>
        <Bookshelf highlightId={highlightId} showTitles={showTitles} />
        <p className="mt-1 text-right text-sm tabular-nums text-muted-foreground">
          {books.length}/{BOOK_LIMIT}
        </p>
      </div>
    </div>
  )
}
