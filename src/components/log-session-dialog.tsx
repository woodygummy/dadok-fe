"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { useDadok } from "@/lib/store"
import type { Book } from "@/lib/types"

export function LogSessionDialog({ book }: { book: Book }) {
  const { logSession } = useDadok()
  const remaining = Math.max(0, book.totalPages - book.currentPage)
  const [open, setOpen] = useState(false)
  const [minutes, setMinutes] = useState("20")
  const [pagesRead, setPagesRead] = useState(
    String(Math.min(12, remaining || 12))
  )
  const [memo, setMemo] = useState("")
  const [error, setError] = useState("")

  function reset() {
    setMinutes("20")
    setPagesRead(String(Math.min(12, remaining || 12)))
    setMemo("")
    setError("")
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    const nextMinutes = Number(minutes)
    const nextPages = Number(pagesRead)
    if (!Number.isFinite(nextMinutes) || nextMinutes < 1) {
      setError("읽은 시간은 1분 이상이어야 합니다.")
      return
    }
    if (!Number.isFinite(nextPages) || nextPages < 0) {
      setError("읽은 쪽 수를 확인해 주세요.")
      return
    }
    logSession({
      bookId: book.id,
      minutes: Math.round(nextMinutes),
      pagesRead: Math.round(nextPages),
      memo,
    })
    reset()
    setOpen(false)
  }

  const finished = remaining === 0 && book.totalPages > 0

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger render={<Button disabled={finished} />}>
        {finished ? "이미 다 읽음" : "오늘 읽기 기록"}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{book.title}</DialogTitle>
            <DialogDescription>
              지금 {book.currentPage}쪽까지 읽었습니다. 남은 쪽은 {remaining}쪽입니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="session-minutes">읽은 시간(분)</Label>
              <Input
                id="session-minutes"
                inputMode="numeric"
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="session-pages">읽은 쪽 수</Label>
              <Input
                id="session-pages"
                inputMode="numeric"
                value={pagesRead}
                onChange={(event) => setPagesRead(event.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="session-memo">한 줄 메모</Label>
            <Textarea
              id="session-memo"
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              placeholder="인상 깊은 문장, 다음에 이을 위치"
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="submit">기록하기</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
