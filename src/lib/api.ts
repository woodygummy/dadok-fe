export type SearchBook = {
  id: string
  title: string
  authors: string
  thumbnail: string | null
}

export async function searchBooks(query: string): Promise<SearchBook[]> {
  const q = query.trim()
  if (!q) return []

  const response = await fetch(`/api/books?q=${encodeURIComponent(q)}`)
  if (!response.ok) {
    throw new Error("책을 찾지 못했습니다.")
  }

  const data = (await response.json()) as { books?: SearchBook[] }
  return data.books ?? []
}
