import type { Metadata } from "next"
import { Lilita_One, Noto_Sans_KR } from "next/font/google"
import { AppProviders } from "@/components/app-providers"
import { AppShell } from "@/components/app-shell"
import "./globals.css"

const notoSansKr = Noto_Sans_KR({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
})

const lilitaOne = Lilita_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-logo",
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
      className={`${notoSansKr.variable} ${lilitaOne.variable} h-full antialiased`}
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
