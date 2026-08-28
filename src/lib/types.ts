export type ThemeName = "white" | "dark" | "wood"

export type Book = {
  id: string
  googleId: string
  title: string
  authors: string
  thumbnail: string | null
  addedAt: string
}

export type Profile = {
  nickname: string
  email: string
  theme: ThemeName
}

export type DadokState = {
  books: Book[]
  profile: Profile
}

export const DEFAULT_PROFILE: Profile = {
  nickname: "다독이",
  email: "guest@dadok.app",
  theme: "white",
}

export const THEME_LABEL: Record<ThemeName, string> = {
  white: "화이트",
  dark: "다크",
  wood: "우드",
}

export const BOOK_LIMIT = 100
