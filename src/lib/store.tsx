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
import { BOOK_LIMIT, CATEGORY_LIMIT, CATEGORY_NAME_MAX, readingStatusOf, type Book, type BookCategory, type DadokState, type ReadingStatus, type ThemeName } from "@/lib/types"

type AddBookInput = {
  googleId: string
  title: string
  authors: string
  thumbnail: string | null
  spineColor?: string | null
  fromMillie?: boolean
  categoryIds?: string[]
}

type StoreValue = {
  ready: boolean
  session: DadokState["session"]
  books: Book[]
  categories: BookCategory[]
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
  updateBook: (
    id: string,
    patch: Partial<Pick<Book, "reading" | "readingStatus" | "memo" | "review" | "rating" | "categoryIds">>
  ) => void
  removeBook: (id: string) => void
  addCategory: (name: string) => BookCategory | null
  removeCategory: (id: string) => void
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
    categories: saved.categories,
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
      reading: false,
      readingStatus: "unread" as ReadingStatus,
      memo: "",
      review: "",
      rating: null,
      finishedAt: null,
      categoryIds: input.categoryIds ?? [],
    }
    commit({
      ...snapshot,
      books: [...snapshot.books, book],
    })
    return book
  }, [])

  const updateBook = useCallback(
    (
      id: string,
      patch: Partial<Pick<Book, "reading" | "readingStatus" | "memo" | "review" | "rating" | "categoryIds">>
    ) => {
      commit({
        ...snapshot,
        books: snapshot.books.map((book) => {
          if (book.id !== id) return book
          const next = {
            ...book,
            ...patch,
            memo: patch.memo != null ? patch.memo : book.memo,
            review: patch.review != null ? patch.review : book.review,
            rating: patch.rating !== undefined ? patch.rating : book.rating,
            categoryIds: patch.categoryIds ?? book.categoryIds,
          }
          const prevStatus = readingStatusOf(book)
          const readingStatus = readingStatusOf(next)
          let finishedAt = book.finishedAt ?? null
          if (readingStatus === "done" && prevStatus !== "done") {
            finishedAt = new Date().toISOString()
          } else if (readingStatus !== "done") {
            finishedAt = null
          }
          return {
            ...next,
            readingStatus,
            reading: readingStatus === "reading",
            finishedAt,
          }
        }),
      })
    },
    []
  )

  const removeBook = useCallback((id: string) => {
    commit({
      ...snapshot,
      books: snapshot.books.filter((book) => book.id !== id),
    })
  }, [])

  const addCategory = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return null
    if (snapshot.categories.length >= CATEGORY_LIMIT) return null
    if (snapshot.categories.some((category) => category.name === trimmed)) {
      return snapshot.categories.find((category) => category.name === trimmed) ?? null
    }
    const category: BookCategory = {
      id: createId("cat"),
      name: trimmed.slice(0, CATEGORY_NAME_MAX),
    }
    commit({
      ...snapshot,
      categories: [...snapshot.categories, category],
    })
    return category
  }, [])

  const removeCategory = useCallback((id: string) => {
    commit({
      ...snapshot,
      categories: snapshot.categories.filter((category) => category.id !== id),
      books: snapshot.books.map((book) => ({
        ...book,
        categoryIds: (book.categoryIds ?? []).filter((categoryId) => categoryId !== id),
      })),
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
      categories: state.categories,
      profile: state.profile,
      login,
      register,
      completeOAuth,
      refreshUser,
      addBook,
      updateBook,
      removeBook,
      addCategory,
      removeCategory,
      setNickname,
      setTheme,
      setAvatar,
      logout,
    }),
    [
      ready,
      state.session,
      state.books,
      state.categories,
      state.profile,
      login,
      register,
      completeOAuth,
      refreshUser,
      addBook,
      updateBook,
      removeBook,
      addCategory,
      removeCategory,
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
      categories: saved.categories,
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
