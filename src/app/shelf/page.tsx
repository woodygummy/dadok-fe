"use client"

import { useMemo, useState } from "react"
import { AddBookDialog } from "@/components/add-book-dialog"
import { Bookshelf } from "@/components/bookshelf"
import { SketchFrame } from "@/components/sketch-stroke"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useDadok } from "@/lib/store"
import {
  BOOK_LIMIT,
  CATEGORY_LIMIT,
  CATEGORY_NAME_MAX,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import { Plus, X } from "lucide-react"

export default function ShelfPage() {
  const { books, categories, addCategory, removeCategory } = useDadok()
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [categoryError, setCategoryError] = useState("")

  const visibleBooks = useMemo(() => {
    if (!activeCategoryId) return books
    return books.filter((book) =>
      (book.categoryIds ?? []).includes(activeCategoryId)
    )
  }, [activeCategoryId, books])

  function handleAddCategory() {
    const created = addCategory(categoryName)
    if (!created) {
      if (categories.length >= CATEGORY_LIMIT) {
        setCategoryError(`칸은 ${CATEGORY_LIMIT}개까지 만들 수 있습니다.`)
      } else if (!categoryName.trim()) {
        setCategoryError("이름을 적어 주세요.")
      } else {
        setCategoryError("같은 이름의 칸이 이미 있습니다.")
      }
      return
    }
    setActiveCategoryId(created.id)
    setCategoryOpen(false)
    setCategoryName("")
    setCategoryError("")
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="size-8 shrink-0 rounded-full"
            aria-label="카테고리 칸 만들기"
            disabled={categories.length >= CATEGORY_LIMIT}
            onClick={() => {
              setCategoryError("")
              setCategoryName("")
              setCategoryOpen(true)
            }}
          >
            <Plus className="size-5" />
          </Button>
          <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              className={cn(
                "h-8 shrink-0 rounded-full px-3 text-xs",
                !activeCategoryId
                  ? "bg-[var(--wood)] text-[#FFF8F0]"
                  : "bg-[color-mix(in_srgb,var(--wood)_12%,transparent)]"
              )}
              onClick={() => setActiveCategoryId(null)}
            >
              전체
            </button>
            {categories.map((category) => {
              const selected = activeCategoryId === category.id
              return (
                <span key={category.id} className="flex shrink-0 items-center">
                  <button
                    type="button"
                    className={cn(
                      "h-8 rounded-full px-3 text-xs",
                      selected
                        ? "bg-[var(--wood)] text-[#FFF8F0]"
                        : "bg-[color-mix(in_srgb,var(--wood)_12%,transparent)]",
                      selected ? "rounded-r-none pr-2" : null
                    )}
                    onClick={() => setActiveCategoryId(category.id)}
                  >
                    {category.name}
                  </button>
                  {selected ? (
                    <button
                      type="button"
                      className="flex h-8 w-7 items-center justify-center rounded-r-full bg-[var(--wood)] text-[#FFF8F0]"
                      aria-label={`${category.name} 칸 지우기`}
                      onClick={() => {
                        removeCategory(category.id)
                        setActiveCategoryId(null)
                      }}
                    >
                      <X className="size-3.5" />
                    </button>
                  ) : null}
                </span>
              )
            })}
          </div>
          <AddBookDialog
            categoryId={activeCategoryId}
            onAdded={(id) => {
              setHighlightId(id)
              window.setTimeout(() => setHighlightId(null), 900)
            }}
          />
        </div>
        <Bookshelf
          books={visibleBooks}
          highlightId={highlightId}
        />
        <p className="mt-1 text-right text-sm tabular-nums text-muted-foreground">
          {activeCategoryId
            ? `${visibleBooks.length}권`
            : `${books.length}/${BOOK_LIMIT}`}
        </p>
      </div>

      <Dialog
        open={categoryOpen}
        onOpenChange={(next) => {
          setCategoryOpen(next)
          if (!next) {
            setCategoryName("")
            setCategoryError("")
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="sketch-frame overflow-visible rounded-[24px] bg-[var(--niche)] p-5 ring-0 sm:max-w-md"
        >
          <DialogTitle className="font-serif text-lg">칸 만들기</DialogTitle>
          <p className="text-sm text-muted-foreground">
            추천 받은 책처럼, 책장을 나누고 싶은 이름을 적어 주세요.
          </p>
          <SketchFrame className="rounded-[16px]">
            <Input
              value={categoryName}
              maxLength={CATEGORY_NAME_MAX}
              onChange={(event) => setCategoryName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  handleAddCategory()
                }
              }}
              placeholder="추천 받은 책"
              autoFocus
              className="h-12 rounded-[16px] border-0 bg-transparent px-4 shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
            />
          </SketchFrame>
          {categoryError ? (
            <p className="text-sm text-destructive">{categoryError}</p>
          ) : null}
          <div className="flex gap-2">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 flex-1 rounded-3xl"
                />
              }
            >
              닫기
            </DialogClose>
            <Button
              type="button"
              className="h-12 flex-1 rounded-3xl"
              onClick={handleAddCategory}
            >
              만들기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
