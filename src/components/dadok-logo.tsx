import { cn } from "@/lib/utils"

export function DadokLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-logo block leading-[0.82] text-[var(--wood-deep)] select-none",
        className
      )}
      aria-hidden
    >
      <span className="block">Da</span>
      <span className="block">Dok</span>
    </span>
  )
}
