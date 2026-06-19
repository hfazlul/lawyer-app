"use client"

import { useRef, useState, useTransition } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"
import { toast } from "sonner"

interface ImageUploadProps {
  label?: string
  hint?: string
  value: string
  onChange: (url: string) => void
  required?: boolean
}

export function ImageUpload({ label = "Image", hint, value, onChange, required }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()

  const handleUpload = (file: File) => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          credentials: "same-origin",
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Upload failed")
        onChange(data.url)
        toast.success("Image uploaded — click Save to publish on the public site")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed")
      }
    })
  }

  return (
    <div className="space-y-2">
      <Label>{label}{required ? " *" : ""}</Label>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <div className="flex flex-wrap items-start gap-3">
        {value && (
          <div className="relative h-24 w-24 overflow-hidden rounded-md border bg-muted">
            <Image src={value} alt="" fill className="object-cover" unoptimized />
            <button
              type="button"
              className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5"
              onClick={() => onChange("")}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file)
              e.target.value = ""
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isPending ? "Uploading…" : "Upload image"}
          </Button>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/uploads/… or URL"
            className="max-w-xs text-xs"
          />
        </div>
      </div>
    </div>
  )
}
