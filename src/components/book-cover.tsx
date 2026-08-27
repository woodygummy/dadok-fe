import { cn } from "@/lib/utils"

export function BookCover({
  title,
  hue,
  className,
}: {
  title: string
  hue: number
  className?: string
}) {
  const initial = title.trim().slice(0, 1) || "책"
  return (
    <div
      className={cn(
        "flex aspect-2/3 w-20 shrink-0 items-end rounded-md p-2 text-left shadow-sm ring-1 ring-black/10",
        className
      )}
      style={{
        background: `linear-gradient(160deg, hsl(${hue} 38% 42%), hsl(${hue} 32% 24%))`,
      }}
    >
      <span className="line-clamp-3 text-xs font-medium leading-tight text-white/95">
        {initial}
        <span className="mt-1 block text-[10px] font-normal text-white/80">
          {title}
        </span>
      </span>
    </div>
  )
}
