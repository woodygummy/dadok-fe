/** Placeholder spine colors. Swap these when the final 5–10 colors are ready. */
export const BOOK_SPINE_PALETTE = [
  "#C45C26",
  "#A63D1F",
  "#C4785A",
  "#D7B48A",
  "#6B5344",
  "#3D6B4F",
  "#7A8F72",
  "#3D5C5C",
] as const

export type BookSpineColor = (typeof BOOK_SPINE_PALETTE)[number]

export function pickRandomSpineColor(exclude?: string | null): BookSpineColor {
  const options = exclude
    ? BOOK_SPINE_PALETTE.filter((color) => color !== exclude)
    : [...BOOK_SPINE_PALETTE]
  const pool = options.length > 0 ? options : [...BOOK_SPINE_PALETTE]
  return pool[Math.floor(Math.random() * pool.length)]
}

export function millieSearchUrl(title: string) {
  const keyword = title.split(" - ")[0].trim()
  const params = new URLSearchParams({ keyword })
  return `https://www.millie.co.kr/v3/search/result?${params.toString()}`
}
