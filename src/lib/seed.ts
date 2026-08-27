import type { DadokState } from "@/lib/types"

const hour = 60 * 60 * 1000

export function createSeedState(now = Date.now()): DadokState {
  return {
    books: [
      {
        id: "demian",
        title: "데미안",
        author: "헤르만 헤세",
        totalPages: 248,
        currentPage: 96,
        status: "reading",
        coverHue: 28,
        note: "아침 출근길에 조금씩.",
        addedAt: new Date(now - 15 * 24 * hour).toISOString(),
      },
      {
        id: "cosmos",
        title: "코스모스",
        author: "칼 세이건",
        totalPages: 579,
        currentPage: 214,
        status: "reading",
        coverHue: 220,
        note: "주말에만 진도를 낸다.",
        addedAt: new Date(now - 38 * 24 * hour).toISOString(),
      },
      {
        id: "little-prince",
        title: "어린 왕자",
        author: "생텍쥐페리",
        totalPages: 120,
        currentPage: 120,
        status: "finished",
        coverHue: 48,
        note: "매년 한 번씩 다시 읽는 책.",
        addedAt: new Date(now - 86 * 24 * hour).toISOString(),
      },
      {
        id: "sapiens",
        title: "사피엔스",
        author: "유발 하라리",
        totalPages: 636,
        currentPage: 0,
        status: "wishlist",
        coverHue: 12,
        note: "다음 달 서재에 올리기.",
        addedAt: new Date(now - 6 * 24 * hour).toISOString(),
      },
    ],
    sessions: [
      {
        id: "s1",
        bookId: "demian",
        minutes: 28,
        pagesRead: 14,
        memo: "싱클레어가 크로머를 만나는 장면.",
        loggedAt: new Date(now - 2 * hour).toISOString(),
      },
      {
        id: "s2",
        bookId: "cosmos",
        minutes: 41,
        pagesRead: 18,
        memo: "창백한 푸른 점에 대한 구절.",
        loggedAt: new Date(now - 26 * hour).toISOString(),
      },
      {
        id: "s3",
        bookId: "demian",
        minutes: 22,
        pagesRead: 11,
        memo: "",
        loggedAt: new Date(now - 50 * hour).toISOString(),
      },
    ],
  }
}

export const SEED_STATE = createSeedState()
