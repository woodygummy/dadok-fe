"use client"

import { useCoverColor } from "@/lib/use-cover-color"
import { cn } from "@/lib/utils"

export function BookSpine({
  title,
  authors,
  thumbnail,
  compact = false,
  highlight = false,
  width,
}: {
  title: string
  authors: string
  thumbnail: string | null
  compact?: boolean
  highlight?: boolean
  width: number
}) {
  const backgroundColor = useCoverColor(
    thumbnail,
    `${title}:${thumbnail ?? "none"}`
  )
  const height = compact ? 48 : 73.6

  return (
    <div
      className={cn("relative shrink-0", highlight && "animate-shelf-in")}
      style={{
        width,
        height,
        perspective: 280,
      }}
      title={`${title} · ${authors}`}
    >
      <div
        className="relative h-full w-full origin-left"
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
            className="pointer-events-none absolute inset-y-1 left-1/2 w-px -translate-x-1/2 opacity-25"
            style={{ backgroundColor: "rgba(255,248,240,0.4)" }}
          />
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
    </div>
  )
}
