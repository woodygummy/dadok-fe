"use client"

import { cn } from "@/lib/utils"

/** Figma scatter stroke; 9-slice keeps corner rounds, overlay inset avoids clipping stamps. */
export function SketchStroke({ className }: { className?: string }) {
  return <span aria-hidden className={cn("sketch-stroke", className)} />
}

export function SketchFrame({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("relative overflow-visible", className)} {...props}>
      <div className="relative h-full overflow-hidden rounded-[inherit]">{children}</div>
      <SketchStroke />
    </div>
  )
}

export function SketchLine({ className }: { className?: string }) {
  return <span aria-hidden className={cn("sketch-line", className)} />
}
