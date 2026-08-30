"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "dadok-notifications"
const DEFAULTS = { reminder: true, notice: true }

type Settings = typeof DEFAULTS

export default function NotificationsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<Settings>
      setSettings({
        reminder: parsed.reminder ?? DEFAULTS.reminder,
        notice: parsed.notice ?? DEFAULTS.notice,
      })
    } catch {
      // keep defaults
    }
  }, [])

  function toggle(key: keyof Settings) {
    setSettings((current) => {
      const next = { ...current, [key]: !current[key] }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <div className="space-y-6">
      <Link href="/me" className="text-sm text-muted-foreground">
        이전
      </Link>
      <h1 className="text-lg font-medium">알림 설정</h1>
      <ul className="sketch-frame overflow-hidden rounded-[18px] bg-[var(--niche)]">
        {(
          [
            { key: "reminder", label: "독서 리마인드" },
            { key: "notice", label: "공지" },
          ] as const
        ).map((item, index) => (
          <li key={item.key}>
            {index > 0 ? <div className="sketch-line mx-4" /> : null}
            <div className="flex items-center justify-between gap-3 px-5 py-[0.95rem]">
              <span className="text-[15px] font-medium">{item.label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={settings[item.key]}
                aria-label={item.label}
                onClick={() => toggle(item.key)}
                className={cn(
                  "relative h-7 w-12 rounded-full transition-colors",
                  settings[item.key] ? "bg-[#4a3428]" : "bg-[#d8d4cf]"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-6 rounded-full bg-[#fff8f0] transition-transform",
                    settings[item.key] ? "left-5" : "left-0.5"
                  )}
                />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
