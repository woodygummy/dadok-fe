export type ThemeName = "white" | "dark" | "wood"

export type Provider = "kakao" | "google" | "naver"

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

export type Book = {
  id: string
  googleId: string
  title: string
  authors: string
  thumbnail: string | null
  addedAt: string
  spineColor?: string | null
  fromMillie?: boolean
}

export type Profile = {
  nickname: string
  email: string
  theme: ThemeName
  avatarUrl: string | null
}

export type DadokState = {
  books: Book[]
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
