import { createSeedState, SEED_STATE } from "@/lib/seed"
import type { DadokState } from "@/lib/types"

export const STORAGE_KEY = "dadok-fe:v1"

export function loadState(): DadokState {
  if (typeof window === "undefined") return SEED_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createSeedState()
    const parsed = JSON.parse(raw) as DadokState
    if (!Array.isArray(parsed.books) || !Array.isArray(parsed.sessions)) {
      return createSeedState()
    }
    return parsed
  } catch {
    return createSeedState()
  }
}

export function saveState(state: DadokState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function todayKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function dayKeyFromIso(iso: string) {
  return todayKey(new Date(iso))
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function progressPercent(current: number, total: number) {
  if (total <= 0) return 0
  return Math.min(100, Math.round((current / total) * 100))
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`
}
