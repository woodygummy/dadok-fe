import { cn } from "@/lib/utils"

export function DadokLogo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/dadok-logo.png"
      alt="DaDok"
      width={128}
      height={128}
      className={cn("h-16 w-16 rounded-md object-cover", className)}
    />
  )
}
