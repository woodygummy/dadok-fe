"use client"

import type { ReactNode } from "react"
import { oauthStartUrl } from "@/lib/auth-api"
import type { Provider } from "@/lib/types"

const PROVIDERS: {
  id: Provider
  start: string
  link: string
  className: string
}[] = [
  {
    id: "kakao",
    start: "카카오로 시작하기",
    link: "카카오 연동하기",
    className: "bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FEE500]/90",
  },
  {
    id: "google",
    start: "Google로 시작하기",
    link: "Google 연동하기",
    className:
      "border border-[rgba(92,74,58,0.22)] bg-[#FFF8F0] text-[#3B2414] hover:bg-[#F3EDE3]",
  },
  {
    id: "naver",
    start: "네이버로 시작하기",
    link: "네이버 연동하기",
    className: "bg-[#03C75A] text-white hover:bg-[#03C75A]/90",
  },
]

function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-7" aria-hidden>
      <path
        fill="#3C1E1E"
        d="M12 4.2c-4.7 0-8.5 3-8.5 6.7 0 2.4 1.6 4.5 4 5.7l-.9 3.3c-.1.3.3.6.6.4l3.9-2.6c.3 0 .6.1.9.1 4.7 0 8.5-3 8.5-6.7S16.7 4.2 12 4.2Z"
      />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.74-.07-1.45-.19-2.13H12v4.03h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.42Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.63-2.35l-3.23-2.5c-.9.6-2.04.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.06v2.58A9.99 9.99 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.98A6 6 0 0 1 6.07 12c0-.69.12-1.35.32-1.98V7.44H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.56l3.33-2.58Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.89c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.96 2.89 14.7 2 12 2A9.99 9.99 0 0 0 3.06 7.44l3.33 2.58C7.18 7.65 9.39 5.89 12 5.89Z"
      />
    </svg>
  )
}

function NaverIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
      <path
        fill="#fff"
        d="M13.6 12.5 8.7 5.4H5.2v13.2h5.1v-7.1l4.9 7.1h3.6V5.4h-5.2v7.1Z"
      />
    </svg>
  )
}

const ICONS: Record<Provider, { bg: string; label: string; icon: ReactNode }> = {
  kakao: { bg: "bg-[#FEE500]", label: "카카오로 시작하기", icon: <KakaoIcon /> },
  google: {
    bg: "bg-white shadow-[0_0_0_1.5px_rgba(44,41,38,0.18)]",
    label: "Google로 시작하기",
    icon: <GoogleIcon />,
  },
  naver: { bg: "bg-[#03C75A]", label: "네이버로 시작하기", icon: <NaverIcon /> },
}

export function SocialAuthButtons({
  token,
  mode = "start",
  providers,
  variant = "full",
}: {
  token?: string
  mode?: "start" | "link"
  providers?: Provider[]
  variant?: "full" | "icons"
}) {
  const items = PROVIDERS.filter(
    (provider) => !providers || providers.includes(provider.id)
  )
  if (items.length === 0) return null

  function go(id: Provider) {
    window.location.href = oauthStartUrl(id, token)
  }

  if (variant === "icons") {
    return (
      <div className="flex items-center justify-center gap-7">
        {items.map((provider) => {
          const item = ICONS[provider.id]
          return (
            <button
              key={provider.id}
              type="button"
              aria-label={item.label}
              className={`flex size-14 items-center justify-center rounded-full ${item.bg}`}
              onClick={() => go(provider.id)}
            >
              {item.icon}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {items.map((provider) => (
        <button
          key={provider.id}
          type="button"
          className={`flex h-12 w-full items-center justify-center rounded-3xl text-sm font-medium shadow-[0_8px_20px_rgba(59,36,20,0.08)] ${provider.className}`}
          onClick={() => go(provider.id)}
        >
          {mode === "link" ? provider.link : provider.start}
        </button>
      ))}
    </div>
  )
}
