"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BilingualInput } from "@/components/admin/bilingual-input"
import { updateServicesSetting } from "@/actions/admin/services-setting"
import { useCsrf } from "@/components/admin/csrf-provider"
import { toast } from "sonner"
import type { ServicesSetting } from "@prisma/client"

export function ServicesListingHeroForm({ data }: { data: ServicesSetting | null }) {
  const router = useRouter()
  const csrf = useCsrf()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    bannerTitleEn: data?.bannerTitleEn ?? "Our Legal Services",
    bannerTitleBn: data?.bannerTitleBn ?? "আমাদের আইনি সেবাসমূহ",
    bannerSubtitleEn:
      data?.bannerSubtitleEn ?? "Comprehensive legal solutions with integrity and expertise",
    bannerSubtitleBn: data?.bannerSubtitleBn ?? "সততা ও দক্ষতার সাথে বিস্তৃত আইনি সমাধান",
  })

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        await updateServicesSetting(csrf, form)
        toast.success("Services listing hero saved")
        router.refresh()
      } catch {
        toast.error("Save failed")
      }
    })
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-lg border bg-muted/20 p-4">
      <div>
        <h3 className="font-semibold">Services Listing Page Hero</h3>
        <p className="text-sm text-muted-foreground">
          Banner text at the top of the main <code>/services</code> page.
        </p>
      </div>
      <BilingualInput
        label="Banner Title"
        enName="bannerTitleEn"
        bnName="bannerTitleBn"
        enValue={form.bannerTitleEn}
        bnValue={form.bannerTitleBn}
        onEnChange={(v) => setForm((f) => ({ ...f, bannerTitleEn: v }))}
        onBnChange={(v) => setForm((f) => ({ ...f, bannerTitleBn: v }))}
        required
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
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save Listing Hero"}
      </Button>
    </form>
  )
}
