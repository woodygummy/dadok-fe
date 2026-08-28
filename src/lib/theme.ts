import type { ThemeName } from "@/lib/types"

export function applyTheme(theme: ThemeName) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.dataset.theme = theme
  root.classList.toggle("dark", theme === "dark")
}
