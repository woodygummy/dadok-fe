import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export function BackLink({ href }: { href: string }) {
  return (
    <Link href={href} aria-label="이전" className="-ml-1 inline-flex size-8 items-center justify-start">
      <ChevronLeft className="size-6 text-[#3b2414]" strokeWidth={1.8} />
    </Link>
  )
}
