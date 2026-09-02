import type { Book, DadokState } from "@/lib/types"

const SAMPLE_BOOKS: Book[] = [
  {
    id: "book-1",
    googleId: "g1",
    title: "데미안",
    authors: "헤르만 헤세",
    thumbnail: null,
    addedAt: "2026-03-12T00:00:00.000Z",
    readingStatus: "done",
    finishedAt: "2026-03-20T00:00:00.000Z",
  },
  {
    id: "book-2",
    googleId: "g2",
    title: "나미야 잡화점의 기적",
    authors: "히가시노 게이고",
    thumbnail: null,
    addedAt: "2026-04-02T00:00:00.000Z",
    readingStatus: "done",
    finishedAt: "2026-04-20T00:00:00.000Z",
  },
  {
    id: "book-3",
    googleId: "g3",
    title: "채식주의자",
    authors: "한강",
    thumbnail: null,
    addedAt: "2026-05-18T00:00:00.000Z",
    readingStatus: "done",
    finishedAt: "2026-05-30T00:00:00.000Z",
  },
  {
    id: "book-4",
    googleId: "g4",
    title: "코스모스",
    authors: "칼 세이건",
    thumbnail: null,
    addedAt: "2026-06-01T00:00:00.000Z",
    readingStatus: "done",
    finishedAt: "2026-06-18T00:00:00.000Z",
  },
  {
    id: "book-5",
    googleId: "g5",
    title: "어린 왕자",
    authors: "생텍쥐페리",
    thumbnail: null,
    addedAt: "2026-06-21T00:00:00.000Z",
    readingStatus: "done",
    finishedAt: "2026-06-28T00:00:00.000Z",
  },
  {
    id: "book-6",
    googleId: "g6",
    title: "1984",
    authors: "조지 오웰",
    thumbnail: null,
    addedAt: "2026-07-09T00:00:00.000Z",
    readingStatus: "done",
    finishedAt: "2026-07-22T00:00:00.000Z",
  },
  {
    id: "book-7",
    googleId: "g7",
    title: "총, 균, 쇠",
    authors: "재레드 다이아몬드",
    thumbnail: null,
    addedAt: "2026-07-28T00:00:00.000Z",
  },
  {
    id: "book-8",
    googleId: "g8",
    title: "달러구트 꿈 백화점",
    authors: "이미예",
    thumbnail: null,
    addedAt: "2026-08-11T00:00:00.000Z",
    readingStatus: "done",
    finishedAt: "2026-08-19T00:00:00.000Z",
  },
]

export function isCapturePreview() {
  if (typeof window === "undefined") return false
  if (process.env.NODE_ENV !== "development") return false
  return new URLSearchParams(window.location.search).get("preview") === "1"
}

export function capturePreviewState(): DadokState {
  return {
    books: SAMPLE_BOOKS,
    categories: [],
    profile: {
      nickname: "다독이",
      email: "dadok@example.com",
      theme: "white",
      avatarUrl: null,
    },
    session: {
      token: "capture-preview",
      user: {
        id: "capture-user",
        loginId: "dadok",
        email: "dadok@example.com",
        nickname: "다독이",
        providers: ["kakao"],
        hasPassword: true,
        isAdmin: false,
      },
    },
  }
}
