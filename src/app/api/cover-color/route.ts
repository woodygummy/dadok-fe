import { NextRequest } from "next/server"
import { extractDominantColor } from "@/lib/extract-cover-color"
import { toPlatformColors } from "@/lib/image-colors"

export const runtime = "nodejs"

const cache = new Map<string, string>()

function isAllowedCoverUrl(raw: string) {
  try {
    const url = new URL(raw)
    if (url.protocol !== "http:" && url.protocol !== "https:") return false
    return (
      url.hostname.endsWith("aladin.co.kr") ||
      url.hostname.endsWith("aladin.com")
    )
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  const coverUrl = request.nextUrl.searchParams.get("url")?.trim()
  if (!coverUrl || !isAllowedCoverUrl(coverUrl)) {
    return Response.json({ error: "invalid_cover" }, { status: 400 })
  }

  const cacheKey = `mode:${coverUrl}`
  const cached = cache.get(cacheKey)
  if (cached) {
    return Response.json(toPlatformColors(cached))
  }

  const response = await fetch(coverUrl, {
    headers: { Accept: "image/jpeg,image/jpg,image/*" },
  })
  if (!response.ok) {
    return Response.json({ error: "cover_fetch_failed" }, { status: 502 })
  }

  const hex = extractDominantColor(Buffer.from(await response.arrayBuffer()))
  if (!hex) {
    return Response.json({ error: "extract_failed" }, { status: 422 })
  }

  if (cache.size > 200) cache.clear()
  cache.set(cacheKey, hex)
  return Response.json(toPlatformColors(hex))
}
