import { DEFAULT_PROFILE, type DadokState, type ThemeName } from "@/lib/types"

export const STORAGE_KEY = "dadok-fe:v2"

export function emptyState(): DadokState {
  return {
    books: [],
    profile: { ...DEFAULT_PROFILE },
  }
}

export function loadState(): DadokState {
  if (typeof window === "undefined") return emptyState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as Partial<DadokState>
    const theme = parsed.profile?.theme
    return {
      books: Array.isArray(parsed.books) ? parsed.books : [],
      profile: {
        nickname: parsed.profile?.nickname?.trim() || DEFAULT_PROFILE.nickname,
        email: parsed.profile?.email?.trim() || DEFAULT_PROFILE.email,
        theme: isTheme(theme) ? theme : DEFAULT_PROFILE.theme,
      },
    }
  } catch {
    return emptyState()
  }
}

export function saveState(state: DadokState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`
}

function isTheme(value: unknown): value is ThemeName {
  return value === "white" || value === "dark" || value === "wood"
}
