"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react"
import { applyTheme } from "@/lib/theme"
import {
  createId,
  emptyState,
  loadState,
  saveState,
} from "@/lib/storage"
import { BOOK_LIMIT, type Book, type DadokState, type Profile, type ThemeName } from "@/lib/types"

type AddBookInput = {
  googleId: string
  title: string
  authors: string
  thumbnail: string | null
}

type StoreValue = {
  ready: boolean
  books: Book[]
  profile: Profile
  addBook: (input: AddBookInput) => Book | null
  removeBook: (id: string) => void
  setNickname: (nickname: string) => void
  setTheme: (theme: ThemeName) => void
  logout: () => void
}

let snapshot: DadokState = emptyState()
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

function getServerSnapshot() {
  return emptyState()
}

function commit(next: DadokState) {
  snapshot = next
  saveState(next)
  applyTheme(next.profile.theme)
  emit()
}

const StoreContext = createContext<StoreValue | null>(null)

export function DadokProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )

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

  const logout = useCallback(() => {
    commit(emptyState())
  }, [])

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      books: state.books,
      profile: state.profile,
      addBook,
      removeBook,
      setNickname,
      setTheme,
      logout,
    }),
    [
      ready,
      state.books,
      state.profile,
      addBook,
      removeBook,
      setNickname,
      setTheme,
      logout,
    ]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function hydrateDadokStore() {
  snapshot = loadState()
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
