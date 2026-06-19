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
    officeHoursEn: data?.officeHoursEn ?? "",
    officeHoursBn: data?.officeHoursBn ?? "",
    mapImage: data?.mapImage ?? "",
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
      <BilingualInput label="Office Hours" enName="officeHoursEn" bnName="officeHoursBn"
        enValue={form.officeHoursEn} bnValue={form.officeHoursBn}
        onEnChange={(v) => setForm((f) => ({ ...f, officeHoursEn: v }))}
        onBnChange={(v) => setForm((f) => ({ ...f, officeHoursBn: v }))} multiline />
      <ImageUpload label="Map Image" value={form.mapImage} onChange={(v) => setForm((f) => ({ ...f, mapImage: v }))} />
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
