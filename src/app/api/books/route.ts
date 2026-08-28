import { NextRequest } from "next/server"

type SearchBook = {
  id: string
  title: string
  authors: string
  thumbnail: string | null
}

type GoogleVolume = {
  id: string
  volumeInfo?: {
    title?: string
    authors?: string[]
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
  }
}

type OpenLibraryDoc = {
  key?: string
  title?: string
  author_name?: string[]
  cover_i?: number
}

function httpsUrl(url: string) {
  return url.replace("http://", "https://")
}

async function searchGoogle(q: string): Promise<SearchBook[] | null> {
  const params = new URLSearchParams({
    q,
    maxResults: "20",
    printType: "books",
  })
  const key = process.env.GOOGLE_BOOKS_API_KEY
  if (key) params.set("key", key)

  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?${params.toString()}`,
    { headers: { Accept: "application/json" } }
  )
  if (!response.ok) return null

  const data = (await response.json()) as { items?: GoogleVolume[] }
  return (data.items ?? []).map((item) => {
    const info = item.volumeInfo ?? {}
    const thumbnail =
      info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail ?? null
    return {
      id: item.id,
      title: info.title ?? "제목 없음",
      authors: info.authors?.join(", ") ?? "저자 미상",
      thumbnail: thumbnail ? httpsUrl(thumbnail) : null,
    }
  })
}

async function searchOpenLibrary(q: string): Promise<SearchBook[]> {
  const params = new URLSearchParams({ q, limit: "20" })
  const response = await fetch(
    `https://openlibrary.org/search.json?${params.toString()}`,
    { headers: { Accept: "application/json" } }
  )
  if (!response.ok) return []

  const data = (await response.json()) as { docs?: OpenLibraryDoc[] }
  return (data.docs ?? []).map((doc, index) => ({
    id: doc.key ?? `ol-${index}`,
    title: doc.title ?? "제목 없음",
    authors: doc.author_name?.join(", ") ?? "저자 미상",
    thumbnail: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : null,
  }))
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim()
  if (!q) {
    return Response.json({ books: [] })
  }

  const google = await searchGoogle(q)
  if (google && google.length > 0) {
    return Response.json({ books: google, source: "google" })
  }

  const fallback = await searchOpenLibrary(q)
  return Response.json({ books: fallback, source: "openlibrary" })
}
