"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useDadok } from "@/lib/store"
import type { BookStatus } from "@/lib/types"

export function AddBookDialog({
  triggerLabel = "책 넣기",
}: {
  triggerLabel?: string
}) {
  const router = useRouter()
  const { addBook } = useDadok()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [totalPages, setTotalPages] = useState("320")
  const [status, setStatus] = useState<BookStatus>("wishlist")
  const [note, setNote] = useState("")
  const [error, setError] = useState("")

  function reset() {
    setTitle("")
    setAuthor("")
    setTotalPages("320")
    setStatus("wishlist")
    setNote("")
    setError("")
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim()) {
      setError("책 제목을 적어 주세요.")
      return
    }
    const pages = Number(totalPages)
    if (!Number.isFinite(pages) || pages < 1) {
      setError("쪽 수는 1 이상이어야 합니다.")
      return
    }
    const book = addBook({
      title,
      author,
      totalPages: Math.round(pages),
      status,
      note,
    })
    reset()
    setOpen(false)
    router.push(`/books/${book.id}`)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger render={<Button />}>{triggerLabel}</DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>서재에 책 넣기</DialogTitle>
            <DialogDescription>
              백엔드가 붙기 전이라 이 기기의 브라우저에만 저장됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="book-title">제목</Label>
            <Input
              id="book-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: 데미안"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="book-author">지은이</Label>
            <Input
              id="book-author"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="예: 헤르만 헤세"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
            <div className="grid gap-2">
              <Label htmlFor="book-pages">전체 쪽 수</Label>
              <Input
                id="book-pages"
                inputMode="numeric"
                value={totalPages}
                onChange={(event) => setTotalPages(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>상태</Label>
              <Select
                value={status}
                onValueChange={(value) => {
                  if (value) setStatus(value as BookStatus)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wishlist">읽고 싶음</SelectItem>
                  <SelectItem value="reading">읽는 중</SelectItem>
                  <SelectItem value="finished">다 읽음</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="book-note">메모</Label>
            <Textarea
              id="book-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="왜 읽고 싶은지, 언제 읽을지"
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="submit">서재에 넣기</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
