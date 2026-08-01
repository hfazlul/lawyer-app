"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BilingualInput } from "@/components/admin/bilingual-input"
import { ImageUpload } from "@/components/admin/image-upload"
import { updateContactSettings } from "@/actions/admin/contact"
import { useCsrf } from "@/components/admin/csrf-provider"
import { toast } from "sonner"
import type { ContactSetting } from "@prisma/client"

export function ContactForm({ data }: { data: ContactSetting | null }) {
  const router = useRouter()
  const csrf = useCsrf()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    bannerTitleEn: data?.bannerTitleEn ?? "",
    bannerTitleBn: data?.bannerTitleBn ?? "",
    bannerSubtitleEn: data?.bannerSubtitleEn ?? "",
    bannerSubtitleBn: data?.bannerSubtitleBn ?? "",
    officeHoursEn: data?.officeHoursEn ?? "",
    officeHoursBn: data?.officeHoursBn ?? "",
    mapImage: data?.mapImage ?? "",
    mapQuery: data?.mapQuery ?? "",
    mapEmbedUrl: data?.mapEmbedUrl ?? "",
    phone: data?.phone ?? "",
    email: data?.email ?? "",
    addressEn: data?.addressEn ?? "",
    addressBn: data?.addressBn ?? "",
  })

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        await updateContactSettings(csrf, form)
        toast.success("Contact settings saved")
        router.refresh()
      } catch {
        toast.error("Save failed")
      }
    })
  }

  return (
    <form onSubmit={save} className="space-y-4 max-w-2xl">
      <BilingualInput label="Banner Title" enName="bannerTitleEn" bnName="bannerTitleBn"
        enValue={form.bannerTitleEn} bnValue={form.bannerTitleBn}
        onEnChange={(v) => setForm((f) => ({ ...f, bannerTitleEn: v }))}
        onBnChange={(v) => setForm((f) => ({ ...f, bannerTitleBn: v }))} required />
      <BilingualInput label="Banner Subtitle" enName="bannerSubtitleEn" bnName="bannerSubtitleBn"
        enValue={form.bannerSubtitleEn} bnValue={form.bannerSubtitleBn}
        onEnChange={(v) => setForm((f) => ({ ...f, bannerSubtitleEn: v }))}
        onBnChange={(v) => setForm((f) => ({ ...f, bannerSubtitleBn: v }))} multiline />
      <BilingualInput label="Office Hours" enName="officeHoursEn" bnName="officeHoursBn"
        enValue={form.officeHoursEn} bnValue={form.officeHoursBn}
        onEnChange={(v) => setForm((f) => ({ ...f, officeHoursEn: v }))}
        onBnChange={(v) => setForm((f) => ({ ...f, officeHoursBn: v }))} multiline />
      <ImageUpload label="Map Image (fallback)" value={form.mapImage} onChange={(v) => setForm((f) => ({ ...f, mapImage: v }))} />
      <div className="space-y-2">
        <Label>Map Location Query</Label>
        <Input
          value={form.mapQuery}
          onChange={(e) => setForm((f) => ({ ...f, mapQuery: e.target.value }))}
          placeholder="Address, coordinates, or Google Maps place link"
        />
        <p className="text-xs text-muted-foreground">
          Address, coordinates, or a Google Maps place/share link.
        </p>
      </div>
      <div className="space-y-2">
        <Label>Google Maps Embed URL</Label>
        <Input
          value={form.mapEmbedUrl}
          onChange={(e) => setForm((f) => ({ ...f, mapEmbedUrl: e.target.value }))}
          placeholder="Paste embed src URL or full iframe code from Google Maps"
        />
        <p className="text-xs text-muted-foreground">
          Google Maps → Share → Embed a map. You can paste the full iframe code or only the https://... URL.
        </p>
      </div>
      <BilingualInput label="Address" enName="addressEn" bnName="addressBn"
        enValue={form.addressEn ?? ""} bnValue={form.addressBn ?? ""}
        onEnChange={(v) => setForm((f) => ({ ...f, addressEn: v }))}
        onBnChange={(v) => setForm((f) => ({ ...f, addressBn: v }))} multiline />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Phone</Label><Input value={form.phone ?? ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
        <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email ?? ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
      </div>
      <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save Contact Settings"}</Button>
    </form>
  )
}
