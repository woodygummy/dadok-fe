const FALLBACKS = [
  "#C45C26",
  "#3D6B4F",
  "#7A8F72",
  "#C4785A",
  "#4A3224",
  "#3D5C5C",
  "#A63D1F",
  "#D7B48A",
  "#2F4A4A",
  "#6B5344",
]

export type IOSImageColors = {
  platform: "ios"
  background: string
  primary: string
  secondary: string
  detail: string
}

export type AndroidImageColors = {
  platform: "android"
  dominant: string
  average: string
  vibrant: string
  darkVibrant: string
  lightVibrant: string
}

export type WebImageColors = {
  platform: "web"
  dominant: string
  background: string
  vibrant?: string
}

export type ImageColorsResult =
  | IOSImageColors
  | AndroidImageColors
  | WebImageColors

export function randomFallbackColor(seed = ""): string {
  if (!seed) {
    return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
  }
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return FALLBACKS[Math.abs(hash) % FALLBACKS.length]
}

export function spineColorFromResult(
  result: ImageColorsResult | null | undefined,
  fallback: string
): string {
  if (!result) return fallback
  if (result.platform === "ios") {
    return result.background || result.primary || fallback
  }
  if (result.platform === "android") {
    return result.dominant || result.vibrant || result.average || fallback
  }
  return result.dominant || result.background || fallback
}

export function toPlatformColors(hex: string): ImageColorsResult {
  return {
    platform: "web",
    dominant: hex,
    background: hex,
    vibrant: hex,
  }
}
