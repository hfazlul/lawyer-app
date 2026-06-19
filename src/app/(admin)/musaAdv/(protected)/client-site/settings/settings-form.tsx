"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BilingualInput } from "@/components/admin/bilingual-input"
import { ImageUpload } from "@/components/admin/image-upload"
import { updateSiteSettings } from "@/actions/admin/site-settings"
import { useCsrf } from "@/components/admin/csrf-provider"
import { toast } from "sonner"
import type { SiteSetting } from "@prisma/client"

const empty: Partial<SiteSetting> = {
  logo: "",
  facebook: "",
  youtube: "",
  instagram: "",
  twitter: "",
  siteNameEn: "",
  siteNameBn: "",
  defaultLanguage: "en",
  searchEnabled: true,
  footerTextEn: "",
  footerTextBn: "",
  copyrightEn: "",
  copyrightBn: "",
  footerPhone: "",
  footerEmail: "",
  footerAddressEn: "",
  footerAddressBn: "",
}

export function SiteSettingsForm({ settings }: { settings: SiteSetting | null }) {
  const router = useRouter()
  const csrf = useCsrf()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ ...empty, ...settings })

  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        await updateSiteSettings(csrf, form)
        toast.success("Site settings saved")
        router.refresh()
      } catch {
        toast.error("Could not save settings")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload
            label="Logo"
            hint="Recommended: 112×112 px (or larger), PNG or JPG format. Displayed at 56×56 px on site."
            value={form.logo ?? ""}
            onChange={(v) => set("logo", v)}
          />
          <BilingualInput
            label="Site Name"
            enName="siteNameEn" bnName="siteNameBn"
            enValue={form.siteNameEn ?? ""} bnValue={form.siteNameBn ?? ""}
            onEnChange={(v) => set("siteNameEn", v)} onBnChange={(v) => set("siteNameBn", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Social Links</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {(["facebook", "youtube", "instagram", "twitter"] as const).map((key) => (
            <div key={key} className="space-y-2">
              <Label className="capitalize">{key}</Label>
              <Input value={form[key] ?? ""} onChange={(e) => set(key, e.target.value)} placeholder={`https://${key}.com/...`} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Footer & Contact</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <BilingualInput label="Footer Text" enName="footerTextEn" bnName="footerTextBn"
            enValue={form.footerTextEn ?? ""} bnValue={form.footerTextBn ?? ""}
            onEnChange={(v) => set("footerTextEn", v)} onBnChange={(v) => set("footerTextBn", v)} multiline />
          <BilingualInput label="Copyright" enName="copyrightEn" bnName="copyrightBn"
            enValue={form.copyrightEn ?? ""} bnValue={form.copyrightBn ?? ""}
            onEnChange={(v) => set("copyrightEn", v)} onBnChange={(v) => set("copyrightBn", v)} />
          <BilingualInput label="Address" enName="footerAddressEn" bnName="footerAddressBn"
            enValue={form.footerAddressEn ?? ""} bnValue={form.footerAddressBn ?? ""}
            onEnChange={(v) => set("footerAddressEn", v)} onBnChange={(v) => set("footerAddressBn", v)} multiline />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Footer Phone</Label>
              <Input value={form.footerPhone ?? ""} onChange={(e) => set("footerPhone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Footer Email</Label>
              <Input type="email" value={form.footerEmail ?? ""} onChange={(e) => set("footerEmail", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Options</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="search">Enable site search</Label>
            <Switch id="search" checked={form.searchEnabled ?? true} onCheckedChange={(v) => set("searchEnabled", v)} />
          </div>
          <div className="space-y-2">
            <Label>Default language</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.defaultLanguage ?? "en"}
              onChange={(e) => set("defaultLanguage", e.target.value)}
            >
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save Settings"}</Button>
    </form>
  )
}
