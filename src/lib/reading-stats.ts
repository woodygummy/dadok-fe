import { readingStatusOf, type Book } from "@/lib/types"

export const MONTH_LABELS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
] as const

export function currentYear() {
  return new Date().getFullYear()
}

function localDateParts(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return { year: date.getFullYear(), month: date.getMonth() }
}

function finishedDateOf(book: Book) {
  if (readingStatusOf(book) !== "done") return null
  return book.finishedAt || book.addedAt
}

export function yearBounds(books: Book[]) {
  const now = currentYear()
  let earliest = now
  for (const book of books) {
    const finished = finishedDateOf(book)
    const added = localDateParts(book.addedAt)
    const done = finished ? localDateParts(finished) : null
    if (added && added.year < earliest) earliest = added.year
    if (done && done.year < earliest) earliest = done.year
  }
  return { minYear: Math.min(earliest, now - 5), maxYear: now }
}

export function monthlyFinishedCounts(books: Book[], year: number) {
  const counts = Array.from({ length: 12 }, () => 0)
  for (const book of books) {
    const iso = finishedDateOf(book)
    if (!iso) continue
    const parts = localDateParts(iso)
    if (!parts || parts.year !== year) continue
    counts[parts.month] += 1
  }
  return counts
}
