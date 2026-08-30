"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, User } from "lucide-react"
import { DadokLogo } from "@/components/dadok-logo"
import { HeaderBell } from "@/components/header-bell"
import { SketchFilter } from "@/components/sketch-filter"
import { isCapturePreview } from "@/lib/capture-preview"
import { cn } from "@/lib/utils"
import { useDadok } from "@/lib/store"

function ShelfIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <rect x="4" y="7" width="4" height="11" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="10" y="4" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="16" y="9" width="4" height="9" rx="1" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

const NAV = [
  { href: "/", label: "나만의 서재", icon: Home },
  { href: "/shelf", label: "나만의 책장", icon: ShelfIcon },
  { href: "/me", label: "마이페이지", icon: User },
]

function isAuthPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/auth/")
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { ready, session } = useDadok()
  const authPath = isAuthPath(pathname)
  const capturePreview = isCapturePreview()

  useEffect(() => {
    if (!ready) return
    if (!session && !authPath && !capturePreview) {
      router.replace("/login")
      return
    }
    if (session && (pathname === "/login" || pathname === "/signup") && !capturePreview) {
      router.replace("/")
    }
  }, [authPath, capturePreview, pathname, ready, router, session])

  if (!ready) {
    return (
      <div className="flex min-h-full items-center justify-center text-sm text-muted-foreground">
        불러오는 중…
      </div>
    )
  }

  if (!session && !authPath && !capturePreview) {
    return (
      <div className="flex min-h-full items-center justify-center text-sm text-muted-foreground">
        로그인 화면으로 이동합니다…
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      <SketchFilter />
      <header className="w-full">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-6 pt-5">
          <Link href={session ? "/" : "/login"} aria-label="다독 홈" className="block">
            <DadokLogo className={authPath ? "h-[4.75rem] w-[4.75rem]" : "h-14 w-14"} />
          </Link>
          {session && !authPath ? <HeaderBell /> : null}
        </div>
      </header>
      <main className={cn("mx-auto w-full max-w-md flex-1 px-6 pt-3", authPath ? "pb-10" : "pb-28")}>
        {children}
      </main>
      {authPath ? null : (
        <nav className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-8">
          <div className="grid w-full max-w-[280px] grid-cols-3 rounded-full bg-[#3b2414] px-5 py-3.5 shadow-[0_10px_24px_rgba(59,36,20,0.22)]">
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
                    "flex items-center justify-center",
                    active ? "text-[#f3ede3]" : "text-[#c5b8a8]"
                  )}
                >
                  <Icon className="size-5" />
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
