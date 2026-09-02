export type ThemeName = "white" | "dark" | "wood"

export type Provider = "kakao" | "google" | "naver"

export function isProvider(value: unknown): value is Provider {
  return value === "kakao" || value === "google" || value === "naver"
}

export type AuthUser = {
  id: string
  loginId: string
  email: string
  nickname: string
  providers: Provider[]
  hasPassword: boolean
  isAdmin: boolean
}

export type Session = {
  token: string
  user: AuthUser
}

export type BookCategory = {
  id: string
  name: string
}

export const READING_STATUSES = ["unread", "reading", "done"] as const

export type ReadingStatus = (typeof READING_STATUSES)[number]

export const READING_STATUS_LABEL: Record<ReadingStatus, string> = {
  unread: "읽기전",
  reading: "읽는중",
  done: "완독",
}

export function isReadingStatus(value: unknown): value is ReadingStatus {
  return value === "unread" || value === "reading" || value === "done"
}

export function readingStatusOf(book: {
  readingStatus?: unknown
  reading?: unknown
}): ReadingStatus {
  if (isReadingStatus(book.readingStatus)) return book.readingStatus
  return book.reading === true ? "reading" : "unread"
}

export function nextReadingStatus(current: ReadingStatus): ReadingStatus {
  const index = READING_STATUSES.indexOf(current)
  return READING_STATUSES[(index + 1) % READING_STATUSES.length]
}

export type Book = {
  id: string
  googleId: string
  title: string
  authors: string
  thumbnail: string | null
  addedAt: string
  spineColor?: string | null
  fromMillie?: boolean
  reading?: boolean
  readingStatus?: ReadingStatus
  finishedAt?: string | null
  memo?: string
  review?: string
  rating?: number | null
  categoryIds?: string[]
}

export type Profile = {
  nickname: string
  email: string
  theme: ThemeName
  avatarUrl: string | null
}

export type DadokState = {
  books: Book[]
  categories: BookCategory[]
  profile: Profile
  session: Session | null
}

export const DEFAULT_PROFILE: Profile = {
  nickname: "다독이",
  email: "",
  theme: "white",
  avatarUrl: null,
}

export const THEME_LABEL: Record<ThemeName, string> = {
  white: "화이트",
  dark: "다크",
  wood: "우드",
}

export const BOOK_LIMIT = 100
export const CATEGORY_LIMIT = 20
export const CATEGORY_NAME_MAX = 16
