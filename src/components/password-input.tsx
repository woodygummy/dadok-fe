"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const fieldClass =
  "h-14 rounded-[14px] border-0 bg-transparent px-4 shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"

export function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  invalid,
  describedBy,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  invalid?: boolean
  describedBy?: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn(fieldClass, "pr-12")}
      />
      <button
        type="button"
        className="absolute top-1/2 right-3 z-10 -translate-y-1/2 text-[var(--muted-ink)]"
        onClick={() => setVisible((open) => !open)}
        aria-label={visible ? "비밀번호 가리기" : "비밀번호 보기"}
        aria-pressed={visible}
      >
        {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  )
}
