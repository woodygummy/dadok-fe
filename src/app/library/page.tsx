"use client"

import { useState } from "react"
import { AddBookDialog } from "@/components/add-book-dialog"
import { BookCard } from "@/components/book-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDadok } from "@/lib/store"
import type { BookStatus } from "@/lib/types"

const FILTERS: Array<{ value: "all" | BookStatus; label: string }> = [
  { value: "all", label: "전체" },
  { value: "reading", label: "읽는 중" },
  { value: "wishlist", label: "읽고 싶음" },
  { value: "finished", label: "다 읽음" },
]

export default function LibraryPage() {
  const { books, resetToSeed, clearAll } = useDadok()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"all" | BookStatus>("all")

  const filtered = books.filter((book) => {
    const matchesFilter = filter === "all" || book.status === filter
    const haystack = `${book.title} ${book.author}`.toLowerCase()
    const matchesQuery = haystack.includes(query.trim().toLowerCase())
    return matchesFilter && matchesQuery
  })

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">서재</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {books.length === 0
              ? "책이 없습니다. 한 권을 넣거나 예시 데이터를 불러오세요."
              : `${books.length}권이 이 브라우저에 있습니다.`}
          </p>
        </div>
        <AddBookDialog />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="제목 또는 지은이 검색"
          className="sm:max-w-xs"
        />
        <div className="flex gap-2 text-xs text-muted-foreground sm:ml-auto">
          <Button variant="outline" size="sm" onClick={resetToSeed}>
            예시 다시 넣기
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            비우기
          </Button>
        </div>
      </div>

      <Tabs
        value={filter}
        onValueChange={(value) => {
          if (value) setFilter(value as "all" | BookStatus)
        }}
      >
        <TabsList className="w-full sm:w-fit">
          {FILTERS.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={filter} className="mt-4">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card px-4 py-12 text-center">
              <p className="font-medium">맞는 책이 없습니다</p>
              <p className="mt-1 text-sm text-muted-foreground">
                검색어를 바꾸거나, 다른 상태 탭을 열어 보세요.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filtered.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
