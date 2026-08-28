export type SearchBook = {
  id: string
  title: string
  authors: string
  thumbnail: string | null
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

export async function searchBooks(query = ""): Promise<SearchBook[]> {
  const q = query.trim()
  const url = q ? `/api/books?q=${encodeURIComponent(q)}` : "/api/books"
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("책을 찾지 못했습니다.")
  }

  const data = (await response.json()) as { books?: SearchBook[] }
  return data.books ?? []
}

export async function fetchBookDetail(id: string): Promise<BookDetail | null> {
  const response = await fetch(`/api/books/${encodeURIComponent(id)}`)
  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error("책 정보를 불러오지 못했습니다.")
  }
  const data = (await response.json()) as { book?: BookDetail }
  return data.book ?? null
}
