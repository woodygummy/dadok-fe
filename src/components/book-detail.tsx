"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogSessionDialog } from "@/components/log-session-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookCover } from "@/components/book-cover"
import { useDadok } from "@/lib/store"
import { formatDateTime, progressPercent } from "@/lib/storage"
import { STATUS_LABEL, type BookStatus } from "@/lib/types"

export function BookDetail({ id }: { id: string }) {
  const router = useRouter()
  const { books, sessions, updateBook, removeBook } = useDadok()
  const book = books.find((item) => item.id === id)

  if (!book) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
        <h1 className="text-xl font-semibold">책을 찾지 못했습니다</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          삭제됐거나, 이 브라우저에 없는 책입니다.
        </p>
        <Button
          className="mt-5"
          nativeButton={false}
          render={<Link href="/library" />}
        >
          서재로 돌아가기
        </Button>
      </div>
    )
  }

  const percent = progressPercent(book.currentPage, book.totalPages)
  const history = sessions.filter((session) => session.bookId === book.id)

  function setStatus(status: BookStatus) {
    if (!book) return
    updateBook(book.id, {
      status,
      currentPage:
        status === "finished"
          ? book.totalPages
          : status === "wishlist"
            ? 0
            : book.currentPage,
    })
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/library" />}
      >
        서재로
      </Button>

      <section className="flex flex-col gap-5 sm:flex-row">
        <BookCover
          title={book.title}
          hue={book.coverHue}
          className="h-44 w-28 sm:h-52 sm:w-32"
        />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{STATUS_LABEL[book.status]}</Badge>
            <span className="text-xs text-muted-foreground">
              {book.currentPage} / {book.totalPages}쪽
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{book.title}</h1>
          <p className="text-muted-foreground">{book.author}</p>
          {book.note ? (
            <p className="text-sm leading-6">{book.note}</p>
          ) : (
            <p className="text-sm text-muted-foreground">아직 메모가 없습니다.</p>
          )}
          <Progress value={percent} />
          <div className="flex flex-wrap gap-2 pt-1">
            <LogSessionDialog book={book} />
            {book.status !== "reading" ? (
              <Button variant="outline" onClick={() => setStatus("reading")}>
                읽기 시작
              </Button>
            ) : null}
            {book.status !== "finished" ? (
              <Button variant="outline" onClick={() => setStatus("finished")}>
                다 읽음으로
              </Button>
            ) : null}
            <Button
              variant="destructive"
              onClick={() => {
                removeBook(book.id)
                router.push("/library")
              }}
            >
              서재에서 빼기
            </Button>
          </div>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>읽기 기록</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              이 책에 남긴 기록이 없습니다. 오늘 읽은 시간과 쪽 수를 적어 보세요.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {history.map((session) => (
                <li key={session.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-medium">
                    {session.minutes}분 · {session.pagesRead}쪽
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(session.loggedAt)}
                    {session.memo ? ` · ${session.memo}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
