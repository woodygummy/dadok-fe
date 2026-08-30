"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useDadok } from "@/lib/store"
import { THEME_LABEL } from "@/lib/types"

const MENU = [
  { href: "/me/account", label: "내 계정" },
  { href: "/me/notifications", label: "알림 설정" },
  { href: "/me/inquiry", label: "문의하기" },
] as const

export default function MePage() {
  const { profile } = useDadok()

  return (
    <div className="flex flex-col items-center pt-6">
      <Link
        href="/me/account"
        aria-label="내 계정"
        className="size-[7.25rem] overflow-hidden rounded-full bg-[#d8d4cf]"
      >
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatarUrl} alt="" className="size-full object-cover" />
        ) : null}
      </Link>

      <nav className="mt-14 w-full max-w-[17.75rem]">
        <ul className="sketch-frame overflow-hidden rounded-[18px] bg-[var(--niche)]">
          {MENU.map((item, index) => (
            <li key={item.href}>
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
