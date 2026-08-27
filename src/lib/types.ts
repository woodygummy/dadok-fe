export type BookStatus = "reading" | "wishlist" | "finished"

export type Book = {
  id: string
  title: string
  author: string
  totalPages: number
  currentPage: number
  status: BookStatus
  coverHue: number
  note: string
  addedAt: string
}

export type ReadingSession = {
  id: string
  bookId: string
  minutes: number
  pagesRead: number
  memo: string
  loggedAt: string
}

export type DadokState = {
  books: Book[]
  sessions: ReadingSession[]
}

export const STATUS_LABEL: Record<BookStatus, string> = {
  reading: "읽는 중",
  wishlist: "읽고 싶음",
  finished: "다 읽음",
}
