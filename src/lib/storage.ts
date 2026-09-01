import {
  DEFAULT_PROFILE,
  readingStatusOf,
  type Book,
  type BookCategory,
  type DadokState,
  type ThemeName,
} from "@/lib/types"

export const TOKEN_KEY = "dadok-fe:token"
const LEGACY_KEY = "dadok-fe:v2"

export function emptyState(): DadokState {
  return {
    books: [],
    categories: [],
    profile: { ...DEFAULT_PROFILE },
    session: null,
  }
}

function userKey(userId: string) {
  return `dadok-fe:v2:${userId}`
}

export function loadToken() {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function saveToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY)
}

export function loadState(userId: string): DadokState {
  if (typeof window === "undefined") return emptyState()
  try {
    const raw =
      window.localStorage.getItem(userKey(userId)) ??
      (userId ? null : window.localStorage.getItem(LEGACY_KEY))
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as Partial<DadokState>
    const theme = parsed.profile?.theme
    const avatarUrl = parsed.profile?.avatarUrl
    return {
      books: parseBooks(parsed.books),
      categories: parseCategories(parsed.categories),
      profile: {
        nickname: parsed.profile?.nickname?.trim() || DEFAULT_PROFILE.nickname,
        email: parsed.profile?.email?.trim() || DEFAULT_PROFILE.email,
        theme: isTheme(theme) ? theme : DEFAULT_PROFILE.theme,
        avatarUrl: isAvatarUrl(avatarUrl) ? avatarUrl : null,
      },
      session: null,
    }
  } catch {
    return emptyState()
  }
}

export function saveState(state: DadokState) {
  const userId = state.session?.user.id
  if (!userId) return
  window.localStorage.setItem(
    userKey(userId),
    JSON.stringify({
      books: state.books,
      categories: state.categories,
      profile: state.profile,
    })
  )
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`
}

function parseBooks(value: unknown): Book[] {
  if (!Array.isArray(value)) return []
  const books: Book[] = []
  for (const item of value) {
    if (!item || typeof item !== "object") continue
    const row = item as Book
    if (typeof row.id !== "string" || typeof row.googleId !== "string") continue
    const readingStatus = readingStatusOf(row)
    books.push({
      ...row,
      readingStatus,
      reading: readingStatus === "reading",
    })
  }
  return books
}

function parseCategories(value: unknown): BookCategory[] {
  if (!Array.isArray(value)) return []
  const categories: BookCategory[] = []
  for (const item of value) {
    if (!item || typeof item !== "object") continue
    const row = item as { id?: unknown; name?: unknown }
    const id = typeof row.id === "string" ? row.id.trim() : ""
    const name = typeof row.name === "string" ? row.name.trim() : ""
    if (!id || !name) continue
    categories.push({ id, name })
  }
  return categories
}

function isTheme(value: unknown): value is ThemeName {
  return value === "white" || value === "dark" || value === "wood"
}

function isAvatarUrl(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("data:image/")
}
