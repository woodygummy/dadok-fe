"use client"

import { useEffect, useMemo, useState } from "react"
import {
  randomFallbackColor,
  spineColorFromResult,
  type ImageColorsResult,
} from "@/lib/image-colors"

export function useCoverColor(coverUrl: string | null | undefined, seed: string) {
  const fallback = useMemo(() => randomFallbackColor(seed), [seed])
  const [color, setColor] = useState(fallback)

  useEffect(() => {
    setColor(fallback)
    if (!coverUrl) return

    const controller = new AbortController()

    fetch(`/api/cover-color?url=${encodeURIComponent(coverUrl)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("cover_color_failed")
        return (await response.json()) as ImageColorsResult
      })
      .then((result) => {
        setColor(spineColorFromResult(result, fallback))
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setColor(fallback)
      })

    return () => controller.abort()
  }, [coverUrl, fallback])

  return color
}
