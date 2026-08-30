import type { Metadata } from "next"
import localFont from "next/font/local"
import { AppProviders } from "@/components/app-providers"
import { AppShell } from "@/components/app-shell"
import "./globals.css"

const memomentKkukkukk = localFont({
  src: "./fonts/MemomentKkukkukk.ttf",
  display: "swap",
  weight: "400",
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "다독",
  description: "나만의 서재와 책장",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      data-theme="white"
      className={`${memomentKkukkukk.variable} ${memomentKkukkukk.className} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  )
}
