"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { ReadingChart } from "@/components/reading-chart"
import { useDadok } from "@/lib/store"
import { THEME_LABEL } from "@/lib/types"

export default function MePage() {
  const { profile } = useDadok()

  const menu = [
    { href: "/me/account", label: "내 계정" },
    { href: "/me/notifications", label: "알림 설정" },
  ]

  return (
    <div className="mx-auto flex w-full max-w-[17.75rem] flex-col gap-5 pt-4">
      <ReadingChart />
      <nav className="w-full">
        <ul className="sketch-frame rounded-[18px] bg-[var(--niche)]">
          {menu.map((item, index) => (
            <li key={item.label}>
              {index > 0 ? <div className="sketch-line mx-4" /> : null}
              <Link
                href={item.href}
                className="flex items-center justify-between gap-3 px-5 py-[0.95rem]"
              >
                <span className="text-[15px] font-medium">{item.label}</span>
                <ChevronRight className="size-4 shrink-0 text-[#8a7a6c]" strokeWidth={2} />
              </Link>
            </li>
          ))}
          <li>
            <div className="sketch-line mx-4" />
            <Link
              href="/me/theme"
              className="flex items-center justify-between gap-3 px-5 py-[0.95rem]"
            >
              <span className="text-[15px] font-medium">테마</span>
              <span className="rounded-full bg-[#4a3428] px-3.5 py-1 text-[13px] font-medium text-[#fff8f0]">
                {THEME_LABEL[profile.theme]}
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}
