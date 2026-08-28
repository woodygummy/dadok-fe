export type SearchBook = {
  id: string
  title: string
  authors: string
  thumbnail: string | null
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
