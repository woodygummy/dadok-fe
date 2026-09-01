"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react"
import { fetchMe, loginAccount, registerAccount } from "@/lib/auth-api"
import { capturePreviewState, isCapturePreview } from "@/lib/capture-preview"
import { applyTheme } from "@/lib/theme"
import {
  clearToken,
  createId,
  emptyState,
  loadState,
  loadToken,
  saveState,
  saveToken,
} from "@/lib/storage"
import { BOOK_LIMIT, type Book, type DadokState, type ThemeName } from "@/lib/types"

type AddBookInput = {
  googleId: string
  title: string
  authors: string
  thumbnail: string | null
  spineColor?: string | null
  fromMillie?: boolean
}

type StoreValue = {
  ready: boolean
  session: DadokState["session"]
  books: Book[]
  profile: DadokState["profile"]
  login: (loginId: string, password: string) => Promise<void>
  register: (input: {
    loginId: string
    password: string
    email: string
  }) => Promise<void>
  completeOAuth: (token: string) => Promise<void>
  refreshUser: () => Promise<void>
  addBook: (input: AddBookInput) => Book | null
  removeBook: (id: string) => void
  setNickname: (nickname: string) => void
  setTheme: (theme: ThemeName) => void
  setAvatar: (avatarUrl: string | null) => void
  logout: () => void
}

let snapshot: DadokState = emptyState()
let hydrated = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return snapshot
}

const serverSnapshot = emptyState()

function getServerSnapshot() {
  return serverSnapshot
}

function commit(next: DadokState) {
  snapshot = next
  saveState(next)
  applyTheme(next.profile.theme)
  emit()
}

async function applySession(token: string, user: NonNullable<DadokState["session"]>["user"]) {
  saveToken(token)
  const saved = loadState(user.id)
  commit({
    books: saved.books,
    profile: {
      ...saved.profile,
      nickname: saved.profile.nickname || user.nickname,
      email: user.email || saved.profile.email,
    },
    session: { token, user },
  })
}

const StoreContext = createContext<StoreValue | null>(null)

export function DadokProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const ready = useSyncExternalStore(
    subscribe,
    () => hydrated,
    () => false
  )

  const login = useCallback(async (loginId: string, password: string) => {
    const result = await loginAccount(loginId, password)
    await applySession(result.token, result.user)
  }, [])

  const register = useCallback(
    async (input: { loginId: string; password: string; email: string }) => {
      const result = await registerAccount(input)
      await applySession(result.token, result.user)
    },
    []
  )

  const completeOAuth = useCallback(async (token: string) => {
    const user = await fetchMe(token)
    await applySession(token, user)
  }, [])

  const refreshUser = useCallback(async () => {
    const token = snapshot.session?.token
    if (!token) return
    const user = await fetchMe(token)
    commit({
      ...snapshot,
      profile: {
        ...snapshot.profile,
        email: user.email || snapshot.profile.email,
        nickname: snapshot.profile.nickname || user.nickname,
      },
      session: { token, user },
    })
  }, [])

  const addBook = useCallback((input: AddBookInput) => {
    if (snapshot.books.length >= BOOK_LIMIT) {
      return null
    }
    if (snapshot.books.some((book) => book.googleId === input.googleId)) {
      return null
    }
    const book: Book = {
      id: createId("book"),
      googleId: input.googleId,
      title: input.title.trim(),
      authors: input.authors.trim() || "저자 미상",
      thumbnail: input.thumbnail,
      addedAt: new Date().toISOString(),
      spineColor: input.spineColor ?? null,
      fromMillie: Boolean(input.fromMillie),
    }
    commit({
      ...snapshot,
      books: [...snapshot.books, book],
    })
    return book
  }, [])

  const removeBook = useCallback((id: string) => {
    commit({
      ...snapshot,
      books: snapshot.books.filter((book) => book.id !== id),
    })
  }, [])

  const setNickname = useCallback((nickname: string) => {
    commit({
      ...snapshot,
      profile: {
        ...snapshot.profile,
        nickname: nickname.trim() || snapshot.profile.nickname,
      },
    })
  }, [])

  const setTheme = useCallback((theme: ThemeName) => {
    commit({
      ...snapshot,
      profile: { ...snapshot.profile, theme },
    })
  }, [])

  const setAvatar = useCallback((avatarUrl: string | null) => {
    commit({
      ...snapshot,
      profile: { ...snapshot.profile, avatarUrl },
    })
  }, [])

  const logout = useCallback(() => {
    clearToken()
    snapshot = emptyState()
    applyTheme(snapshot.profile.theme)
    emit()
  }, [])

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      session: state.session,
      books: state.books,
      profile: state.profile,
      login,
      register,
      completeOAuth,
      refreshUser,
      addBook,
      removeBook,
      setNickname,
      setTheme,
      setAvatar,
      logout,
    }),
    [
      ready,
      state.session,
      state.books,
      state.profile,
      login,
      register,
      completeOAuth,
      refreshUser,
      addBook,
      removeBook,
      setNickname,
      setTheme,
      setAvatar,
      logout,
    ]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export async function hydrateDadokStore() {
  if (isCapturePreview()) {
    snapshot = capturePreviewState()
    hydrated = true
    applyTheme(snapshot.profile.theme)
    emit()
    return
  }
  const token = loadToken()
  if (!token) {
    snapshot = emptyState()
    hydrated = true
    applyTheme(snapshot.profile.theme)
    emit()
    return
  }
  try {
    const user = await fetchMe(token)
    const saved = loadState(user.id)
    snapshot = {
      books: saved.books,
      profile: {
        ...saved.profile,
        nickname: saved.profile.nickname || user.nickname,
        email: user.email || saved.profile.email,
      },
      session: { token, user },
    }
  } catch {
    clearToken()
    snapshot = emptyState()
  }
  hydrated = true
  applyTheme(snapshot.profile.theme)
  emit()
}

export function useDadok() {
  const value = useContext(StoreContext)
  if (!value) {
    throw new Error("useDadok must be used inside DadokProvider")
  }
  return value
}
