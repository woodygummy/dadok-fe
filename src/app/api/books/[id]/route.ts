import { NextRequest } from "next/server"

type AladinItem = {
  itemId?: number | string
  isbn?: string
  isbn13?: string
  title?: string
  author?: string
  cover?: string
  publisher?: string
  pubDate?: string
  description?: string
  categoryName?: string
}

type AladinResponse = {
  item?: AladinItem[]
}

export type BookDetail = {
  id: string
  title: string
  authors: string
  thumbnail: string | null
  publisher: string | null
  pubDate: string | null
  isbn13: string | null
  description: string | null
  category: string | null
}

function parseAladinJson(text: string): AladinResponse {
  const trimmed = text.trim()
  const jsonText = trimmed.startsWith("{")
    ? trimmed
    : trimmed.slice(trimmed.indexOf("{"), trimmed.lastIndexOf("}") + 1)
  return JSON.parse(jsonText) as AladinResponse
}

function stripHtml(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function itemIdType(id: string): "ISBN13" | "ISBN" | "ItemId" {
  const digits = id.replace(/-/g, "")
  if (/^\d{13}$/.test(digits)) return "ISBN13"
  if (/^\d{9}[\dXx]$/.test(digits)) return "ISBN"
  return "ItemId"
}

function mapItem(item: AladinItem, fallbackId: string): BookDetail {
  const id =
    item.isbn13 ||
    item.isbn ||
    (item.itemId != null ? String(item.itemId) : fallbackId)
  const thumbnail = item.cover
    ? item.cover.replace("http://", "https://")
    : null
  const description = item.description ? stripHtml(item.description) : null
  return {
    id,
    title: item.title?.trim() || "제목 없음",
    authors: item.author?.trim() || "저자 미상",
    thumbnail,
    publisher: item.publisher?.trim() || null,
    pubDate: item.pubDate?.trim() || null,
    isbn13: item.isbn13?.trim() || item.isbn?.trim() || null,
    description: description || null,
    category: item.categoryName?.trim() || null,
  }
}

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/books/[id]">
) {
  const { id } = await context.params
  const bookId = decodeURIComponent(id).trim()
  if (!bookId) {
    return Response.json({ error: "missing_id" }, { status: 400 })
  }

  const ttbkey = process.env.ALADIN_TTB_KEY?.trim()
  if (!ttbkey) {
    return Response.json({ error: "aladin_key_missing" }, { status: 503 })
  }

  const params = new URLSearchParams({
    ttbkey,
    ItemIdType: itemIdType(bookId),
    ItemId: bookId.replace(/-/g, ""),
    output: "js",
    Version: "20131101",
    Cover: "Big",
    OptResult: "description",
  })

  try {
    const response = await fetch(
      `https://www.aladin.co.kr/ttb/api/ItemLookUp.aspx?${params.toString()}`,
      { headers: { Accept: "application/json, text/plain, */*" } }
    )
    if (!response.ok) {
      return Response.json({ error: "aladin_unavailable" }, { status: 502 })
    }
    const item = parseAladinJson(await response.text()).item?.[0]
    if (!item) {
      return Response.json({ error: "not_found" }, { status: 404 })
    }
    return Response.json({ book: mapItem(item, bookId) })
  } catch {
    return Response.json({ error: "aladin_unavailable" }, { status: 502 })
  }
}
