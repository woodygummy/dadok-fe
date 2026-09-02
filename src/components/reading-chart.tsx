"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  MONTH_LABELS,
  currentYear,
  monthlyFinishedCounts,
  yearBounds,
} from "@/lib/reading-stats"
import { useDadok } from "@/lib/store"
import { cn } from "@/lib/utils"

export function ReadingChart() {
  const { books } = useDadok()
  const { minYear, maxYear } = useMemo(() => yearBounds(books), [books])
  const [year, setYear] = useState(() => currentYear())
  const selectedYear = Math.min(maxYear, Math.max(minYear, year))
  const counts = useMemo(
    () => monthlyFinishedCounts(books, selectedYear),
    [books, selectedYear]
  )
  const total = counts.reduce((sum, count) => sum + count, 0)
  const peak = Math.max(1, ...counts)

  return (
    <section className="sketch-frame w-full rounded-[18px] bg-[var(--niche)] px-4 pb-3 pt-4">
      <div className="mb-4 flex items-end justify-between gap-3 px-1">
        <div>
          <h2 className="text-[15px] font-medium">월별 독서량</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">완독한 책</p>
        </div>
        <p className="text-[13px] text-muted-foreground">
          <span className="text-base font-medium text-foreground">{total}</span>권
        </p>
      </div>

      <div className="flex h-36 items-end gap-[5px] px-0.5">
        {counts.map((count, month) => {
          const height = count === 0 ? 4 : Math.max(10, Math.round((count / peak) * 100))
          return (
            <div key={MONTH_LABELS[month]} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div className="flex h-28 w-full items-end justify-center">
                <div
                  className={cn(
                    "w-[70%] max-w-[14px] rounded-[3px]",
                    count > 0 ? "bg-[var(--sage)]" : "bg-foreground/10"
                  )}
                  style={{ height: `${height}%` }}
                  title={`${MONTH_LABELS[month]} ${count}권`}
                  aria-label={`${selectedYear}년 ${MONTH_LABELS[month]} 완독 ${count}권`}
                />
              </div>
              <span className="text-[10px] leading-none text-muted-foreground">
                {month + 1}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-1 flex items-center justify-center gap-5 pt-2">
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-full text-foreground disabled:opacity-30"
          aria-label="이전 년도"
          disabled={selectedYear <= minYear}
          onClick={() =>
            setYear((value) => Math.max(minYear, Math.min(maxYear, value) - 1))
          }
        >
          <ChevronLeft className="size-5" strokeWidth={2} />
        </button>
        <p className="min-w-[4.5rem] text-center text-[15px] font-medium tabular-nums">
          {selectedYear}
        </p>
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-full text-foreground disabled:opacity-30"
          aria-label="다음 년도"
          disabled={selectedYear >= maxYear}
          onClick={() =>
            setYear((value) => Math.min(maxYear, Math.max(minYear, value) + 1))
          }
        >
          <ChevronRight className="size-5" strokeWidth={2} />
        </button>
      </div>
    </section>
  )
}
