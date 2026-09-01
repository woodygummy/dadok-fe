"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Store, X } from "lucide-react"
import { SketchFrame } from "@/components/sketch-stroke"
import {
  DEFAULT_ROOM_LOADOUT,
  ROOM_ITEMS,
  ROOM_LAYER_LABEL,
  ROOM_LAYERS,
  parseRoomLoadout,
  roomItemOf,
  type RoomLayer,
  type RoomLoadout,
} from "@/lib/room"
import { useDadok } from "@/lib/store"
import { cn } from "@/lib/utils"

const ROOM_STORAGE_KEY = "dadok-fe:room-loadout"

function Placeholder({
  name,
  color,
  className,
  round,
}: {
  name: string
  color: string
  className?: string
  round?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center text-center text-[11px] font-medium leading-tight text-[#3A3A38]",
        round ? "rounded-full" : "rounded-[6px]",
        className
      )}
      style={{ backgroundColor: color }}
    >
      {name}
    </div>
  )
}

function loadSavedLoadout(): RoomLoadout {
  if (typeof window === "undefined") return DEFAULT_ROOM_LOADOUT
  try {
    return parseRoomLoadout(JSON.parse(window.localStorage.getItem(ROOM_STORAGE_KEY) ?? "null"))
  } catch {
    return DEFAULT_ROOM_LOADOUT
  }
}

export function StudyRoom() {
  const { books } = useDadok()
  const [shopOpen, setShopOpen] = useState(false)
  const [tab, setTab] = useState<RoomLayer>("chair")
  const [loadout, setLoadout] = useState<RoomLoadout>(DEFAULT_ROOM_LOADOUT)

  useEffect(() => {
    setLoadout(loadSavedLoadout())
  }, [])

  const selectItem = useCallback((layer: RoomLayer, id: string) => {
    setLoadout((current) => {
      const next = { ...current, [layer]: id }
      window.localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const wallpaper = roomItemOf("wallpaper", loadout.wallpaper)
  const floor = roomItemOf("floor", loadout.floor)
  const plant = roomItemOf("plant", loadout.plant)
  const bookshelf = roomItemOf("bookshelf", loadout.bookshelf)
  const lamp = roomItemOf("lamp", loadout.lamp)
  const desk = roomItemOf("desk", loadout.desk)
  const clock = roomItemOf("clock", loadout.clock)
  const chair = roomItemOf("chair", loadout.chair)
  const tabItems = ROOM_ITEMS[tab]

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={cn("relative min-h-0", shopOpen ? "flex-[60]" : "flex-1")}>
        <SketchFrame className="absolute inset-0 rounded-[10px]">
          <div className="relative size-full">
            <div className="absolute inset-0" style={{ backgroundColor: wallpaper.color }} />
            <div
              className="absolute inset-x-0 bottom-0 h-[32%]"
              style={{ backgroundColor: floor.color }}
            />

            <Placeholder
              name={clock.name}
              color={clock.color}
              round
              className="absolute top-[12%] left-[8%] z-[2] size-[18%] min-h-12 min-w-12"
            />
            <Placeholder
              name={lamp.name}
              color={lamp.color}
              className="absolute top-[5%] left-[40%] z-[3] h-[16%] w-[18%] min-h-10"
            />
            <Link
              href="/shelf"
              aria-label={`책장으로 이동, 책 ${books.length}권`}
              className="absolute top-[16%] right-[6%] bottom-[10%] z-[4] w-[22%] min-w-16"
            >
              <Placeholder
                name={bookshelf.name}
                color={bookshelf.color}
                className="size-full flex-col gap-1 px-1.5 py-2"
              />
            </Link>
            <Placeholder
              name={plant.name}
              color={plant.color}
              className="absolute bottom-[8%] left-[5%] z-[5] h-[18%] w-[14%] min-h-12"
            />
            <Placeholder
              name={chair.name}
              color={chair.color}
              className="absolute bottom-[12%] left-[30%] z-[6] h-[20%] w-[16%] min-h-12"
            />
            <Placeholder
              name={desk.name}
              color={desk.color}
              className="absolute right-[30%] bottom-[7%] left-[22%] z-[7] h-[10%] min-h-8 text-[#F6F0E2]"
            />

            <button
              type="button"
              aria-label={shopOpen ? "상점 닫기" : "상점 열기"}
              aria-pressed={shopOpen}
              onClick={() => setShopOpen((open) => !open)}
              className="absolute top-3 right-3 z-20 flex size-11 items-center justify-center rounded-full bg-[#3b2414] text-[#FFF8F0]"
            >
              {shopOpen ? <X className="size-5" /> : <Store className="size-5" />}
            </button>
          </div>
        </SketchFrame>
      </div>

      {shopOpen ? (
      <div className="mt-3 flex min-h-0 flex-[40] flex-col">
        <div className="flex gap-1.5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ROOM_LAYERS.map((layer) => {
            const selected = tab === layer
            return (
              <button
                key={layer}
                type="button"
                onClick={() => setTab(layer)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[13px]",
                  selected
                    ? "bg-[#3b2414] text-[#FFF8F0]"
                    : "bg-[#F3EDE3] text-[#3b2414]"
                )}
              >
                {ROOM_LAYER_LABEL[layer]}
              </button>
            )
          })}
        </div>
        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden pt-1">
          <div className="flex h-full gap-3">
            {tabItems.map((item) => {
              const selected = loadout[tab] === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectItem(tab, item.id)}
                  aria-pressed={selected}
                  className="h-full w-[30%] min-w-[5.5rem] shrink-0"
                >
                  <SketchFrame
                    className={cn(
                      "h-full rounded-[10px]",
                      selected ? "ring-2 ring-[#3b2414] ring-offset-2" : ""
                    )}
                  >
                    <div
                      className="flex size-full flex-col items-center justify-center gap-2 px-2"
                      style={{ backgroundColor: item.color }}
                    >
                      <span className="text-[13px] font-medium text-[#3A3A38]">
                        {item.name}
                      </span>
                    </div>
                  </SketchFrame>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      ) : null}
    </div>
  )
}
