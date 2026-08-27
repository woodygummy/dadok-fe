import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookCover } from "@/components/book-cover"
import { progressPercent } from "@/lib/storage"
import { STATUS_LABEL, type Book } from "@/lib/types"

export function BookCard({ book }: { book: Book }) {
  const percent = progressPercent(book.currentPage, book.totalPages)

  return (
    <Link href={`/books/${book.id}`} className="block">
      <Card className="h-full transition-colors hover:bg-accent/40">
        <CardContent className="flex gap-4">
          <BookCover title={book.title} hue={book.coverHue} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-medium">{book.title}</h3>
                <p className="text-sm text-muted-foreground">{book.author}</p>
              </div>
              <Badge variant="secondary">{STATUS_LABEL[book.status]}</Badge>
            </div>
            <div className="mt-3 space-y-1.5">
              <Progress value={percent} className="gap-1" />
              <p className="text-xs text-muted-foreground">
                {book.currentPage} / {book.totalPages}쪽 · {percent}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
