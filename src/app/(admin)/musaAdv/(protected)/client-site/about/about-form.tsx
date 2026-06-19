"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BilingualInput } from "@/components/admin/bilingual-input"
import { ImageUpload } from "@/components/admin/image-upload"
import { updateAboutPage } from "@/actions/admin/about"
import { useCsrf } from "@/components/admin/csrf-provider"
import { toast } from "sonner"
import type { AboutPage } from "@prisma/client"

export function AboutForm({ data }: { data: AboutPage | null }) {
  const router = useRouter()
  const csrf = useCsrf()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    image: data?.image ?? "",
    bioEn: data?.bioEn ?? "",
    bioBn: data?.bioBn ?? "",
    experienceEn: data?.experienceEn ?? "",
    experienceBn: data?.experienceBn ?? "",
    educationEn: data?.educationEn ?? "",
    educationBn: data?.educationBn ?? "",
    missionEn: data?.missionEn ?? "",
    missionBn: data?.missionBn ?? "",
    valuesEn: data?.valuesEn ?? "",
    valuesBn: data?.valuesBn ?? "",
  })

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        await updateAboutPage(csrf, form)
        toast.success("About page saved")
        router.refresh()
      } catch {
        toast.error("Save failed")
      }
    })
  }

  return (
    <form onSubmit={save} className="space-y-4 max-w-2xl">
      <ImageUpload label="Profile Image" value={form.image} onChange={(v) => setForm((f) => ({ ...f, image: v }))} />
      <BilingualInput label="Bio" enName="bioEn" bnName="bioBn" enValue={form.bioEn} bnValue={form.bioBn}
        onEnChange={(v) => setForm((f) => ({ ...f, bioEn: v }))} onBnChange={(v) => setForm((f) => ({ ...f, bioBn: v }))} multiline />
      <BilingualInput label="Experience" enName="experienceEn" bnName="experienceBn" enValue={form.experienceEn} bnValue={form.experienceBn}
        onEnChange={(v) => setForm((f) => ({ ...f, experienceEn: v }))} onBnChange={(v) => setForm((f) => ({ ...f, experienceBn: v }))} multiline />
      <BilingualInput label="Education" enName="educationEn" bnName="educationBn" enValue={form.educationEn} bnValue={form.educationBn}
        onEnChange={(v) => setForm((f) => ({ ...f, educationEn: v }))} onBnChange={(v) => setForm((f) => ({ ...f, educationBn: v }))} multiline />
      <BilingualInput label="Mission" enName="missionEn" bnName="missionBn" enValue={form.missionEn} bnValue={form.missionBn}
        onEnChange={(v) => setForm((f) => ({ ...f, missionEn: v }))} onBnChange={(v) => setForm((f) => ({ ...f, missionBn: v }))} multiline />
      <BilingualInput label="Values" enName="valuesEn" bnName="valuesBn" enValue={form.valuesEn} bnValue={form.valuesBn}
        onEnChange={(v) => setForm((f) => ({ ...f, valuesEn: v }))} onBnChange={(v) => setForm((f) => ({ ...f, valuesBn: v }))} multiline />
      <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save About Page"}</Button>
    </form>
  )
}
