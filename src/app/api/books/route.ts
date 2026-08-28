import { NextRequest } from "next/server"

type SearchBook = {
  id: string
  title: string
  authors: string
  thumbnail: string | null
}

type AladinItem = {
  itemId?: number | string
  isbn?: string
  isbn13?: string
  title?: string
  author?: string
  cover?: string
}

type AladinResponse = {
  item?: AladinItem[]
}

const LIST_TYPES = ["Bestseller", "ItemNewAll", "ItemNewSpecial", "BlogBest"] as const

function parseAladinJson(text: string): AladinResponse {
  const trimmed = text.trim()
  const jsonText = trimmed.startsWith("{")
    ? trimmed
    : trimmed.slice(trimmed.indexOf("{"), trimmed.lastIndexOf("}") + 1)
  return JSON.parse(jsonText) as AladinResponse
}

function mapItems(items: AladinItem[]): SearchBook[] {
  return items.map((item, index) => {
    const id =
      item.isbn13 ||
      item.isbn ||
      (item.itemId != null ? String(item.itemId) : `aladin-${index}`)
    const thumbnail = item.cover
      ? item.cover.replace("http://", "https://")
      : null
    return {
      id,
      title: item.title?.trim() || "제목 없음",
      authors: item.author?.trim() || "저자 미상",
      thumbnail,
    }
  })
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function requireKey() {
  const ttbkey = process.env.ALADIN_TTB_KEY?.trim()
  if (!ttbkey) {
    return null
  }
  return ttbkey
}

async function fetchAladin(url: string): Promise<SearchBook[]> {
  const response = await fetch(url, {
    headers: { Accept: "application/json, text/plain, */*" },
  })
  if (!response.ok) {
    throw new Error("aladin_unavailable")
  }
  return mapItems(parseAladinJson(await response.text()).item ?? [])
}

async function searchAladin(ttbkey: string, q: string) {
  const params = new URLSearchParams({
    ttbkey,
    Query: q,
    QueryType: "Keyword",
    MaxResults: "20",
    start: "1",
    SearchTarget: "Book",
    output: "js",
    Version: "20131101",
    Cover: "MidBig",
  })
  return fetchAladin(
    `https://www.aladin.co.kr/ttb/api/ItemSearch.aspx?${params.toString()}`
  )
}

async function randomAladin(ttbkey: string) {
  const queryType = LIST_TYPES[Math.floor(Math.random() * LIST_TYPES.length)]
  const start = String(Math.floor(Math.random() * 3) + 1)
  const params = new URLSearchParams({
    ttbkey,
    QueryType: queryType,
    MaxResults: "20",
    start,
    SearchTarget: "Book",
    output: "js",
    Version: "20131101",
    Cover: "MidBig",
  })
  const books = await fetchAladin(
    `https://www.aladin.co.kr/ttb/api/ItemList.aspx?${params.toString()}`
  )
  return shuffle(books)
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? ""

  const ttbkey = requireKey()
  if (!ttbkey) {
    return Response.json(
      { books: [], error: "aladin_key_missing" },
      { status: 503 }
    )
  }

  try {
    const books = q ? await searchAladin(ttbkey, q) : await randomAladin(ttbkey)
    return Response.json({ books, source: "aladin" })
  } catch {
    return Response.json(
      { books: [], error: "aladin_unavailable" },
      { status: 502 }
    )
  }
}
