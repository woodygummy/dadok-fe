"use client"

import Link from "next/link"
import { AddBookDialog } from "@/components/add-book-dialog"
import { BookCard } from "@/components/book-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDadok } from "@/lib/store"
import { formatDateTime } from "@/lib/storage"

export default function HomePage() {
  const { books, sessions, minutesToday, pagesToday, streakDays } = useDadok()
  const reading = books.filter((book) => book.status === "reading")
  const recent = sessions.slice(0, 4)

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">읽기 기록 초안</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            오늘도 한 쪽만 더
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            다독은 지금 읽는 책, 오늘 쌓인 시간, 이어서 펼칠 위치를 한곳에
            모아 둡니다. 이 초안은 브라우저에만 저장되며 백엔드는 아직 붙지
            않았습니다.
          </p>
        </div>
        <AddBookDialog triggerLabel="책 넣기" />
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="오늘 읽은 시간" value={`${minutesToday}분`} />
        <StatCard label="오늘 넘긴 쪽" value={`${pagesToday}쪽`} />
        <StatCard
          label="연속 기록"
          value={streakDays > 0 ? `${streakDays}일` : "아직 없음"}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">지금 읽는 책</h2>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/library" />}
          >
            서재 보기
          </Button>
        </div>
        {reading.length === 0 ? (
          <EmptyReading />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {reading.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">최근 기록</h2>
        {recent.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            아직 남긴 읽기 기록이 없습니다. 책 상세에서 오늘 읽기를 적어 보세요.
          </p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
            {recent.map((session) => {
              const book = books.find((item) => item.id === session.bookId)
              return (
                <li key={session.id} className="px-4 py-3">
                  <p className="text-sm font-medium">
                    {book?.title ?? "삭제된 책"}
                    <span className="ml-2 font-normal text-muted-foreground">
                      {session.minutes}분 · {session.pagesRead}쪽
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDateTime(session.loggedAt)}
                    {session.memo ? ` · ${session.memo}` : ""}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent />
    </Card>
  )
}

function EmptyReading() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center">
      <p className="font-medium">지금 펼쳐 둔 책이 없습니다</p>
      <p className="mt-1 text-sm text-muted-foreground">
        서재에서 책을 고르거나, 새 책을 넣고 읽기를 시작하세요.
      </p>
      <div className="mt-4 flex justify-center">
        <AddBookDialog triggerLabel="첫 책 넣기" />
      </div>
    </div>
  )
}
