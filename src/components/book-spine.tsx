"use client"

import { useCoverColor } from "@/lib/use-cover-color"
import { cn } from "@/lib/utils"

function isLightColor(hex: string) {
  const value = hex.replace("#", "")
  if (value.length !== 6) return false
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 155
}

function truncateSpineTitle(title: string, maxChars: number) {
  const cleaned = title.trim()
  if (cleaned.length <= maxChars) return cleaned
  return `${cleaned.slice(0, Math.max(1, maxChars - 1))}…`
}

function spineAuthor(authors: string) {
  const cleaned = authors.trim()
  if (!cleaned || cleaned === "저자 미상") return ""
  const first = cleaned.split(",")[0]?.trim() ?? ""
  return first.replace(/\s*\([^)]*\)\s*$/, "").trim()
}

export function BookSpine({
  title,
  authors,
  thumbnail,
  color,
  compact = false,
  highlight = false,
  width,
  onSelect,
}: {
  title: string
  authors: string
  thumbnail: string | null
  color?: string | null
  compact?: boolean
  highlight?: boolean
  width: number
  onSelect?: () => void
}) {
  const extractedColor = useCoverColor(
    color ? null : thumbnail,
    `${title}:${thumbnail ?? "none"}`
  )
  const backgroundColor = color || extractedColor
  const height = compact ? 64 * 1.7 - 16 : 96 * 1.7 - 16
  const fontSize = compact ? 8 : 10
  const authorName = spineAuthor(authors)
  const authorSize = compact ? 6 : 7
  const authorReserve = authorName ? authorSize + 6 : 0
  const maxChars = Math.max(
    1,
    Math.floor((height - 12 - authorReserve) / (fontSize * 1.08))
  )
  const frameClass = cn(
    "relative shrink-0",
    highlight && "animate-shelf-in",
    onSelect &&
      "relative z-[1] cursor-pointer appearance-none border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--sage)]"
  )
  const frameStyle = {
    width,
    height,
    perspective: 280,
  } as const

  const body = (
    <div
      className="pointer-events-none relative h-full w-full origin-left"
      style={{
        transform: "rotateY(-20deg)",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className="absolute inset-0 overflow-hidden rounded-[2px]"
        style={{
          backgroundColor,
          boxShadow:
            "inset -6px 0 10px rgba(44, 28, 20, 0.28), 3px 4px 8px rgba(59, 36, 20, 0.18)",
        }}
      >
        <span
          className="pointer-events-none absolute inset-x-0 top-0 flex justify-center overflow-hidden pt-1.5 font-medium"
          style={{ bottom: authorReserve }}
        >
          <span
            className="max-h-full overflow-hidden"
            style={{
              writingMode: "vertical-rl",
              textOrientation: "upright",
              fontSize,
              lineHeight: 1,
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              color: isLightColor(backgroundColor) ? "#3B2414" : "#FFF8F0",
            }}
          >
            {truncateSpineTitle(title, maxChars)}
          </span>
        </span>
        {authorName ? (
          <span
            className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden px-px pb-0.5 text-center font-medium"
            style={{
              fontSize: authorSize,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              color: isLightColor(backgroundColor) ? "#3B2414" : "#FFF8F0",
            }}
          >
            {authorName}
          </span>
        ) : null}
      </div>
      <div
        className="absolute top-0 h-full rounded-r-[1px]"
        style={{
          width: 6,
          right: -5,
          background: `linear-gradient(90deg, color-mix(in srgb, ${backgroundColor}, #1a120c 40%), #f4eee4)`,
          transform: "rotateY(78deg)",
          transformOrigin: "left center",
        }}
      />
    </div>
  )

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onSelect()
        }}
        className={frameClass}
        style={frameStyle}
        title={`${title} · ${authors}`}
        aria-label={`${title} 상세 보기`}
      >
        {body}
      </button>
    )
  }

  return (
    <div
      className={frameClass}
      style={frameStyle}
      title={`${title} · ${authors}`}
    >
      {body}
    </div>
  )
}
