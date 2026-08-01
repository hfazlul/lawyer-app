"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BilingualInput } from "@/components/admin/bilingual-input"
import { BilingualRichInput } from "@/components/admin/bilingual-rich-input"
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
    bannerTitleEn: data?.bannerTitleEn ?? "",
    bannerTitleBn: data?.bannerTitleBn ?? "",
    bannerSubtitleEn: data?.bannerSubtitleEn ?? "",
    bannerSubtitleBn: data?.bannerSubtitleBn ?? "",
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
    <form onSubmit={save} className="max-w-3xl space-y-4">
      <div className="space-y-4 rounded-lg border border-dashed bg-muted/20 p-4">
        <h3 className="font-semibold">Page Hero</h3>
        <BilingualInput
          label="Banner Title"
          enName="bannerTitleEn"
          bnName="bannerTitleBn"
          enValue={form.bannerTitleEn}
          bnValue={form.bannerTitleBn}
          onEnChange={(v) => setForm((f) => ({ ...f, bannerTitleEn: v }))}
          onBnChange={(v) => setForm((f) => ({ ...f, bannerTitleBn: v }))}
        />
        <BilingualInput
          label="Banner Subtitle"
          enName="bannerSubtitleEn"
          bnName="bannerSubtitleBn"
          enValue={form.bannerSubtitleEn}
          bnValue={form.bannerSubtitleBn}
          onEnChange={(v) => setForm((f) => ({ ...f, bannerSubtitleEn: v }))}
          onBnChange={(v) => setForm((f) => ({ ...f, bannerSubtitleBn: v }))}
          multiline
        />
      </div>
      <ImageUpload label="Profile Image" value={form.image} onChange={(v) => setForm((f) => ({ ...f, image: v }))} />
      <BilingualRichInput
        label="Bio"
        enValue={form.bioEn}
        bnValue={form.bioBn}
        onEnChange={(v) => setForm((f) => ({ ...f, bioEn: v }))}
        onBnChange={(v) => setForm((f) => ({ ...f, bioBn: v }))}
      />
      <BilingualRichInput
        label="Experience"
        enValue={form.experienceEn}
        bnValue={form.experienceBn}
        onEnChange={(v) => setForm((f) => ({ ...f, experienceEn: v }))}
        onBnChange={(v) => setForm((f) => ({ ...f, experienceBn: v }))}
      />
      <BilingualRichInput
        label="Education"
        enValue={form.educationEn}
        bnValue={form.educationBn}
        onEnChange={(v) => setForm((f) => ({ ...f, educationEn: v }))}
        onBnChange={(v) => setForm((f) => ({ ...f, educationBn: v }))}
      />
      <BilingualRichInput
        label="Mission"
        enValue={form.missionEn}
        bnValue={form.missionBn}
        onEnChange={(v) => setForm((f) => ({ ...f, missionEn: v }))}
        onBnChange={(v) => setForm((f) => ({ ...f, missionBn: v }))}
      />
      <BilingualInput label="Values" enName="valuesEn" bnName="valuesBn" enValue={form.valuesEn} bnValue={form.valuesBn}
        onEnChange={(v) => setForm((f) => ({ ...f, valuesEn: v }))} onBnChange={(v) => setForm((f) => ({ ...f, valuesBn: v }))} multiline />
      <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save About Page"}</Button>
    </form>
  )
}
