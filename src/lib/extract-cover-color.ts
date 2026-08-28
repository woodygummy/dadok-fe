import { decode } from "jpeg-js"

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0"))
    .join("")}`
}

export function extractDominantColor(buffer: Buffer): string | null {
  if (buffer.length < 3) return null

  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8
  if (!isJpeg) return null

  const decoded = decode(buffer, { maxResolutionInMP: 2, useTArray: true })
  const { data, width, height } = decoded
  if (!width || !height) return null

  const counts = new Map<number, number>()
  const step = Math.max(1, Math.floor((width * height) / 12000))

  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    if (max > 248 && min > 232) continue
    if (max < 18) continue

    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  let bestKey = -1
  let bestCount = 0
  for (const [key, count] of counts) {
    if (count > bestCount) {
      bestKey = key
      bestCount = count
    }
  }
  if (bestKey < 0) return null

  const r = ((bestKey >> 10) & 31) << 3
  const g = ((bestKey >> 5) & 31) << 3
  const b = (bestKey & 31) << 3
  return rgbToHex(r + 4, g + 4, b + 4)
}
