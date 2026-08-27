"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react"
import { createSeedState, SEED_STATE } from "@/lib/seed"
import {
  createId,
  dayKeyFromIso,
  loadState,
  saveState,
  todayKey,
} from "@/lib/storage"
import type { Book, BookStatus, DadokState, ReadingSession } from "@/lib/types"

type AddBookInput = {
  title: string
  author: string
  totalPages: number
  status: BookStatus
  note: string
}

type LogSessionInput = {
  bookId: string
  minutes: number
  pagesRead: number
  memo: string
}

type StoreValue = {
  ready: boolean
  books: Book[]
  sessions: ReadingSession[]
  addBook: (input: AddBookInput) => Book
  updateBook: (id: string, patch: Partial<Book>) => void
  removeBook: (id: string) => void
  logSession: (input: LogSessionInput) => void
  resetToSeed: () => void
  clearAll: () => void
  minutesToday: number
  pagesToday: number
  streakDays: number
}

let snapshot: DadokState = structuredClone(SEED_STATE)
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
  return SEED_STATE
}

function commit(next: DadokState) {
  snapshot = next
  saveState(next)
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
    const book: Book = {
      id: createId("book"),
      title: input.title.trim(),
      author: input.author.trim() || "지은이 미상",
      totalPages: input.totalPages,
      currentPage: input.status === "finished" ? input.totalPages : 0,
      status: input.status,
      coverHue: Math.floor(Math.random() * 360),
      note: input.note.trim(),
      addedAt: new Date().toISOString(),
    }
    commit({
      ...snapshot,
      books: [book, ...snapshot.books],
    })
    return book
  }, [])

  const updateBook = useCallback((id: string, patch: Partial<Book>) => {
    commit({
      ...snapshot,
      books: snapshot.books.map((book) =>
        book.id === id ? { ...book, ...patch } : book
      ),
    })
  }, [])

  const removeBook = useCallback((id: string) => {
    commit({
      ...snapshot,
      books: snapshot.books.filter((book) => book.id !== id),
      sessions: snapshot.sessions.filter((session) => session.bookId !== id),
    })
  }, [])

  const logSession = useCallback((input: LogSessionInput) => {
    const book = snapshot.books.find((item) => item.id === input.bookId)
    if (!book) return
    const nextPage = Math.min(book.totalPages, book.currentPage + input.pagesRead)
    const nextStatus: BookStatus =
      nextPage >= book.totalPages && book.totalPages > 0
        ? "finished"
        : "reading"
    const session: ReadingSession = {
      id: createId("session"),
      bookId: input.bookId,
      minutes: input.minutes,
      pagesRead: input.pagesRead,
      memo: input.memo.trim(),
      loggedAt: new Date().toISOString(),
    }
    commit({
      books: snapshot.books.map((item) =>
        item.id === book.id
          ? { ...item, currentPage: nextPage, status: nextStatus }
          : item
      ),
      sessions: [session, ...snapshot.sessions],
    })
  }, [])

  const resetToSeed = useCallback(() => {
    commit(createSeedState())
  }, [])

  const clearAll = useCallback(() => {
    commit({ books: [], sessions: [] })
  }, [])

  const minutesToday = useMemo(() => {
    const key = todayKey()
    return state.sessions
      .filter((session) => dayKeyFromIso(session.loggedAt) === key)
      .reduce((sum, session) => sum + session.minutes, 0)
  }, [state.sessions])

  const pagesToday = useMemo(() => {
    const key = todayKey()
    return state.sessions
      .filter((session) => dayKeyFromIso(session.loggedAt) === key)
      .reduce((sum, session) => sum + session.pagesRead, 0)
  }, [state.sessions])

  const streakDays = useMemo(() => {
    const days = new Set(state.sessions.map((session) => dayKeyFromIso(session.loggedAt)))
    let streak = 0
    const cursor = new Date()
    while (days.has(todayKey(cursor))) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    }
    return streak
  }, [state.sessions])

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      books: state.books,
      sessions: state.sessions,
      addBook,
      updateBook,
      removeBook,
      logSession,
      resetToSeed,
      clearAll,
      minutesToday,
      pagesToday,
      streakDays,
    }),
    [
      ready,
      state.books,
      state.sessions,
      addBook,
      updateBook,
      removeBook,
      logSession,
      resetToSeed,
      clearAll,
      minutesToday,
      pagesToday,
      streakDays,
    ]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function hydrateDadokStore() {
  snapshot = loadState()
  emit()
}

export function useDadok() {
  const value = useContext(StoreContext)
  if (!value) {
    throw new Error("useDadok must be used inside DadokProvider")
  }
  return value
}
