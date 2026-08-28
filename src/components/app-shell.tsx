"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookMarked, Home, User } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/", label: "나만의 서재", icon: Home },
  { href: "/shelf", label: "나만의 책장", icon: BookMarked },
  { href: "/me", label: "마이페이지", icon: User },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-full flex-col">
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-24 pt-5">
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[rgba(92,74,58,0.16)] bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-3">
          {NAV.map((item) => {
            const Icon = item.icon
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-[11px]",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
