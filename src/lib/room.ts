export const ROOM_LAYERS = [
  "wallpaper",
  "floor",
  "plant",
  "bookshelf",
  "lamp",
  "desk",
  "clock",
  "chair",
] as const

export type RoomLayer = (typeof ROOM_LAYERS)[number]

export type RoomItem = {
  id: string
  name: string
  color: string
}

export type RoomLoadout = Record<RoomLayer, string>

export const ROOM_LAYER_LABEL: Record<RoomLayer, string> = {
  wallpaper: "벽지",
  floor: "바닥",
  plant: "화분",
  bookshelf: "책장",
  lamp: "전등",
  desk: "책상",
  clock: "시계",
  chair: "의자",
}

export const ROOM_ITEMS: Record<RoomLayer, RoomItem[]> = {
  wallpaper: [
    { id: "wallpaper-1", name: "벽지1", color: "#D7E4D6" },
    { id: "wallpaper-2", name: "벽지2", color: "#F6F0E2" },
    { id: "wallpaper-3", name: "벽지3", color: "#C8DCA8" },
  ],
  floor: [
    { id: "floor-1", name: "바닥1", color: "#B6A392" },
    { id: "floor-2", name: "바닥2", color: "#8D6E4E" },
    { id: "floor-3", name: "바닥3", color: "#4A2C1C" },
  ],
  plant: [
    { id: "plant-1", name: "화분1", color: "#D24A32" },
    { id: "plant-2", name: "화분2", color: "#2F5C40" },
    { id: "plant-3", name: "화분3", color: "#7D8B58" },
  ],
  bookshelf: [
    { id: "bookshelf-1", name: "책장1", color: "#F6F0E2" },
    { id: "bookshelf-2", name: "책장2", color: "#4A2C1C" },
    { id: "bookshelf-3", name: "책장3", color: "#2C3E6A" },
  ],
  lamp: [
    { id: "lamp-1", name: "전등1", color: "#7BB0D8" },
    { id: "lamp-2", name: "전등2", color: "#D6A21A" },
    { id: "lamp-3", name: "전등3", color: "#E98658" },
  ],
  desk: [
    { id: "desk-1", name: "책상1", color: "#4A2C1C" },
    { id: "desk-2", name: "책상2", color: "#3A3A38" },
    { id: "desk-3", name: "책상3", color: "#B6A392" },
  ],
  clock: [
    { id: "clock-1", name: "시계1", color: "#F6F0E2" },
    { id: "clock-2", name: "시계2", color: "#2C3E6A" },
    { id: "clock-3", name: "시계3", color: "#D6A21A" },
  ],
  chair: [
    { id: "chair-1", name: "의자1", color: "#2C3E6A" },
    { id: "chair-2", name: "의자2", color: "#D24A32" },
    { id: "chair-3", name: "의자3", color: "#7D8B58" },
  ],
}

export const DEFAULT_ROOM_LOADOUT: RoomLoadout = {
  wallpaper: "wallpaper-1",
  floor: "floor-1",
  plant: "plant-1",
  bookshelf: "bookshelf-1",
  lamp: "lamp-1",
  desk: "desk-1",
  clock: "clock-1",
  chair: "chair-1",
}

export function roomItemOf(layer: RoomLayer, id: string): RoomItem {
  const items = ROOM_ITEMS[layer]
  return items.find((item) => item.id === id) ?? items[0]
}

export function isRoomLayer(value: string): value is RoomLayer {
  return (ROOM_LAYERS as readonly string[]).includes(value)
}

export function parseRoomLoadout(value: unknown): RoomLoadout {
  const next = { ...DEFAULT_ROOM_LOADOUT }
  if (!value || typeof value !== "object") return next
  const row = value as Record<string, unknown>
  for (const layer of ROOM_LAYERS) {
    const id = row[layer]
    if (typeof id === "string" && ROOM_ITEMS[layer].some((item) => item.id === id)) {
      next[layer] = id
    }
  }
  return next
}
