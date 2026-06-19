"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BilingualInput } from "@/components/admin/bilingual-input"
import { ImageUpload } from "@/components/admin/image-upload"
import { updateAppointmentSettings } from "@/actions/admin/appointment"
import { useCsrf } from "@/components/admin/csrf-provider"
import { toast } from "sonner"
import type { AppointmentSetting } from "@prisma/client"

export function AppointmentForm({ data }: { data: AppointmentSetting | null }) {
  const router = useRouter()
  const csrf = useCsrf()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    bannerTitleEn: data?.bannerTitleEn ?? "",
    bannerTitleBn: data?.bannerTitleBn ?? "",
    officeHoursEn: data?.officeHoursEn ?? "",
    officeHoursBn: data?.officeHoursBn ?? "",
    mapImage: data?.mapImage ?? "",
    contactPhone: data?.contactPhone ?? "",
    contactEmail: data?.contactEmail ?? "",
  })

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        await updateAppointmentSettings(csrf, form)
        toast.success("Appointment settings saved")
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Contact Phone</Label><Input value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} /></div>
        <div className="space-y-2"><Label>Contact Email</Label><Input type="email" value={form.contactEmail} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} /></div>
      </div>
      <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save Appointment Settings"}</Button>
    </form>
  )
}
