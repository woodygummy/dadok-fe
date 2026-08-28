export async function readAvatarFile(file: File) {
  const bitmap = await createImageBitmap(file)
  const size = 256
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext("2d")
  if (!context) {
    throw new Error("avatar_canvas_unavailable")
  }

  const side = Math.min(bitmap.width, bitmap.height)
  const sx = (bitmap.width - side) / 2
  const sy = (bitmap.height - side) / 2
  context.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size)
  bitmap.close()
  return canvas.toDataURL("image/jpeg", 0.82)
}
