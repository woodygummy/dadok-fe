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

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim()
  if (!q) {
    return Response.json({ books: [] })
  }

  const ttbkey = process.env.ALADIN_TTB_KEY?.trim()
  if (!ttbkey) {
    return Response.json(
      { books: [], error: "aladin_key_missing" },
      { status: 503 }
    )
  }

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

  const response = await fetch(
    `https://www.aladin.co.kr/ttb/api/ItemSearch.aspx?${params.toString()}`,
    { headers: { Accept: "application/json, text/plain, */*" } }
  )

  if (!response.ok) {
    return Response.json(
      { books: [], error: "aladin_unavailable" },
      { status: 502 }
    )
  }

  try {
    const books = mapItems(parseAladinJson(await response.text()).item ?? [])
    return Response.json({ books, source: "aladin" })
  } catch {
    return Response.json(
      { books: [], error: "aladin_parse_failed" },
      { status: 502 }
    )
  }
}
