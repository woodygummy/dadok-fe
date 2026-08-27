import type { Metadata } from "next"
import { Noto_Sans_KR } from "next/font/google"
import { AppProviders } from "@/components/app-providers"
import { AppShell } from "@/components/app-shell"
import "./globals.css"

const notoSansKr = Noto_Sans_KR({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "다독",
  description: "오늘 읽은 쪽과 시간을 가볍게 남기는 읽기 기록",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  )
}
