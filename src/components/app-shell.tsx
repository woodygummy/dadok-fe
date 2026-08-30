"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BookMarked, Home, User } from "lucide-react"
import { DadokLogo } from "@/components/dadok-logo"
import { SketchFilter } from "@/components/sketch-filter"
import { isCapturePreview } from "@/lib/capture-preview"
import { cn } from "@/lib/utils"
import { useDadok } from "@/lib/store"

const NAV = [
  { href: "/", label: "나만의 서재", icon: Home },
  { href: "/shelf", label: "나만의 책장", icon: BookMarked },
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
        <div className="mx-auto flex w-full max-w-md items-center justify-start px-6 pt-5">
          <Link href={session ? "/" : "/login"} aria-label="다독 홈" className="block">
            <DadokLogo className={authPath ? "h-[4.75rem] w-[4.75rem]" : "h-14 w-14"} />
          </Link>
        </div>
      </header>
      <main className={cn("mx-auto w-full max-w-md flex-1 px-6 pt-3", authPath ? "pb-10" : "pb-24")}>
        {children}
      </main>
      {authPath ? null : (
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
      )}
    </div>
  )
}
