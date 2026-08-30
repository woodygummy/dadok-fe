"use client"

import { useRef } from "react"
import { X } from "lucide-react"

export type PickedImage = {
  file: File
  preview: string
}

export function ImagePicker({
  images,
  onChange,
  max = 3,
}: {
  images: PickedImage[]
  onChange: (images: PickedImage[]) => void
  max?: number
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(list: FileList | null) {
    if (!list) return
    const next = [...images]
    for (const file of Array.from(list)) {
      if (!file.type.startsWith("image/")) continue
      if (next.length >= max) break
      next.push({ file, preview: URL.createObjectURL(file) })
    }
    onChange(next)
  }

  function removeAt(index: number) {
    const target = images[index]
    if (target) URL.revokeObjectURL(target.preview)
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {images.map((image, index) => (
          <div key={image.preview} className="relative size-20 overflow-hidden rounded-xl bg-[#d8d4cf]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.preview} alt="" className="size-full object-cover" />
            <button
              type="button"
              aria-label="이미지 빼기"
              className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-[#3b2414] text-[#fff8f0]"
              onClick={() => removeAt(index)}
            >
              <X className="size-3" strokeWidth={2.4} />
            </button>
          </div>
        ))}
      </div>
      {images.length < max ? (
        <button
          type="button"
          className="text-sm text-muted-foreground"
          onClick={() => inputRef.current?.click()}
        >
          스크린샷 첨부 ({images.length}/{max})
        </button>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(event) => {
          addFiles(event.target.files)
          event.target.value = ""
        }}
      />
    </div>
  )
}
