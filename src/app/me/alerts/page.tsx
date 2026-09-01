"use client"

import { BackLink } from "@/components/back-link"

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <BackLink href="/me" />
      <h1 className="text-lg font-medium">알림</h1>
      <p className="text-sm text-muted-foreground">알림이 없습니다.</p>
    </div>
  )
}
