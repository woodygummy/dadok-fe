"use client"

import { Check } from "lucide-react"
import { BackLink } from "@/components/back-link"
import { useDadok } from "@/lib/store"
import { THEME_LABEL, type ThemeName } from "@/lib/types"

const THEMES: ThemeName[] = ["white", "dark", "wood"]

export default function ThemePage() {
  const { profile, setTheme } = useDadok()

  return (
    <div className="space-y-6">
      <BackLink href="/me" />
      <h1 className="text-lg font-medium">테마</h1>
      <ul className="sketch-frame rounded-[18px] bg-[var(--niche)]">
        {THEMES.map((theme, index) => (
          <li key={theme}>
            {index > 0 ? <div className="sketch-line mx-4" /> : null}
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-5 py-[0.95rem] text-left"
              onClick={() => setTheme(theme)}
            >
              <span className="text-[15px] font-medium">{THEME_LABEL[theme]}</span>
              {profile.theme === theme ? (
                <Check className="size-4 text-[var(--wood)]" strokeWidth={2.4} />
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
