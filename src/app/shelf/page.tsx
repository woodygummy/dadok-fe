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
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const visibleBooks = useMemo(() => {
    if (!activeCategoryId) return books
    return books.filter((book) =>
      (book.categoryIds ?? []).includes(activeCategoryId)
    )
  }, [activeCategoryId, books])

  function handleAddCategory() {
    const trimmed = categoryName.trim()
    if (!trimmed) {
      setCategoryError("이름을 적어 주세요.")
      return
    }
    if (categories.length >= CATEGORY_LIMIT) {
      setCategoryError(`칸은 ${CATEGORY_LIMIT}개까지 만들 수 있습니다.`)
      return
    }
    if (categories.some((category) => category.name === trimmed)) {
      setCategoryError("같은 이름의 칸이 이미 있습니다.")
      return
    }
    const created = addCategory(categoryName)
    if (!created) {
      setCategoryError(`칸은 ${CATEGORY_LIMIT}개까지 만들 수 있습니다.`)
      return
    }
    setCategoryName("")
    setCategoryError("")
  }

  function confirmDeleteCategory() {
    if (!pendingDeleteId) return
    if (activeCategoryId === pendingDeleteId) {
      setActiveCategoryId(null)
    }
    removeCategory(pendingDeleteId)
    setPendingDeleteId(null)
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
            onClick={() => {
              setCategoryError("")
              setCategoryName("")
              setPendingDeleteId(null)
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
                <button
                  key={category.id}
                  type="button"
                  className={cn(
                    "h-8 shrink-0 rounded-full px-3 text-xs",
                    selected
                      ? "bg-[var(--wood)] text-[#FFF8F0]"
                      : "bg-[color-mix(in_srgb,var(--wood)_12%,transparent)]"
                  )}
                  onClick={() => setActiveCategoryId(category.id)}
                >
                  {category.name}
                </button>
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
            setPendingDeleteId(null)
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="inset-0 m-auto h-fit max-h-[calc(100vh-2rem)] w-full max-w-[min(28rem,calc(100%-2rem))] translate-x-0 translate-y-0 overflow-visible border-0 bg-transparent p-4 shadow-none ring-0 sm:max-w-md"
        >
          <div className="sketch-frame relative min-w-0 overflow-visible rounded-[24px] bg-[var(--niche)] p-5">
            <DialogTitle className="font-serif text-lg">카테고리 생성하기</DialogTitle>
            {categories.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {categories.map((category) => (
                  <span
                    key={category.id}
                    className="inline-flex max-w-full items-center rounded-full bg-[color-mix(in_srgb,var(--wood)_12%,transparent)] pl-3"
                  >
                    <span className="max-w-[10rem] truncate py-1.5 text-xs">
                      {category.name}
                    </span>
                    <button
                      type="button"
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground"
                      aria-label={`${category.name} 삭제`}
                      onClick={() => setPendingDeleteId(category.id)}
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
            <SketchFrame className="mt-4 rounded-[16px]">
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
                placeholder="ex) 소설, 추천 받은 책"
                autoFocus
                className="h-12 rounded-[16px] border-0 bg-transparent px-4 shadow-none placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
              />
            </SketchFrame>
            {categoryError ? (
              <p className="mt-4 text-sm text-destructive">{categoryError}</p>
            ) : null}
            <div className="mt-4 flex gap-2">
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
            {pendingDeleteId ? (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-5">
                <button
                  type="button"
                  className="absolute inset-0 rounded-[24px] bg-[rgba(59,36,20,0.28)]"
                  aria-label="취소"
                  onClick={() => setPendingDeleteId(null)}
                />
                <div
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="delete-category-title"
                  className="relative z-10 w-full max-w-xs rounded-[24px] bg-[var(--card)] p-5 text-[var(--card-foreground)] shadow-[0_18px_40px_rgba(59,36,20,0.22)]"
                >
                  <p id="delete-category-title" className="font-medium">
                    삭제하시겠습니까?
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-2xl"
                      onClick={() => setPendingDeleteId(null)}
                    >
                      취소
                    </Button>
                    <Button
                      type="button"
                      className="h-11 rounded-2xl"
                      onClick={confirmDeleteCategory}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
