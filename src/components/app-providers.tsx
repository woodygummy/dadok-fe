"use client"

import { useEffect } from "react"
import { DadokProvider, hydrateDadokStore } from "@/lib/store"

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    hydrateDadokStore()
  }, [])

  return <DadokProvider>{children}</DadokProvider>
}
