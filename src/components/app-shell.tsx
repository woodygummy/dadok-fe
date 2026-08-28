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
      <header className="w-full">
        <div className="mx-auto flex w-full max-w-md items-center justify-start px-4 pt-3">
          <Link href="/" aria-label="다독 홈" className="block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dadok-logo.png"
              alt="DaDok"
              width={127}
              height={98}
              className="h-10 w-auto dark:invert"
            />
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-24 pt-3">
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
                aria-label={item.label}
                className={cn(
                  "flex flex-col items-center py-3",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="size-5" />
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
