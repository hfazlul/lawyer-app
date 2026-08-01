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
import {
  DEFAULT_THEME_GOLD,
  DEFAULT_THEME_NAVY,
  THEME_PRESETS,
  hexToHslComponents,
  hslComponentsToHex,
} from "@/lib/site-theme"
import { DEFAULT_LAYOUT_MARGIN, MAX_LAYOUT_MARGIN, MIN_LAYOUT_MARGIN } from "@/lib/site-layout"
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
  themeNavy: DEFAULT_THEME_NAVY,
  themeGold: DEFAULT_THEME_GOLD,
  layoutFullWidth: false,
  layoutMargin: 16,
}

export function SiteSettingsForm({ settings }: { settings: SiteSetting | null }) {
  const router = useRouter()
  const csrf = useCsrf()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ ...empty, ...settings })

  const set = (key: keyof typeof form, value: string | boolean | number) =>
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
        <CardHeader>
          <CardTitle>Theme Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Each client site can use its own colors. Changes apply to the public website after save.
          </p>
          <div className="flex flex-wrap gap-2">
            {THEME_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  set("themeNavy", preset.navy)
                  set("themeGold", preset.gold)
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Primary (Navy)</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={hslComponentsToHex(form.themeNavy ?? DEFAULT_THEME_NAVY)}
                  onChange={(e) => set("themeNavy", hexToHslComponents(e.target.value))}
                  className="h-10 w-14 cursor-pointer rounded border border-input bg-background p-1"
                />
                <Input
                  value={form.themeNavy ?? ""}
                  onChange={(e) => set("themeNavy", e.target.value)}
                  placeholder={DEFAULT_THEME_NAVY}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Accent (Gold)</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={hslComponentsToHex(form.themeGold ?? DEFAULT_THEME_GOLD)}
                  onChange={(e) => set("themeGold", hexToHslComponents(e.target.value))}
                  className="h-10 w-14 cursor-pointer rounded border border-input bg-background p-1"
                />
                <Input
                  value={form.themeGold ?? ""}
                  onChange={(e) => set("themeGold", e.target.value)}
                  placeholder={DEFAULT_THEME_GOLD}
                />
              </div>
            </div>
          </div>
          <div className="flex overflow-hidden rounded-lg border">
            <div
              className="flex flex-1 items-center justify-center py-8 text-sm font-medium text-white"
              style={{ background: `hsl(${form.themeNavy ?? DEFAULT_THEME_NAVY})` }}
            >
              Header / Footer
            </div>
            <div
              className="flex flex-1 items-center justify-center py-8 text-sm font-semibold"
              style={{
                background: `hsl(${form.themeGold ?? DEFAULT_THEME_GOLD})`,
                color: `hsl(${form.themeNavy ?? DEFAULT_THEME_NAVY})`,
              }}
            >
              Buttons / Accents
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Boxed layout keeps rounded corners and side margins. Full width removes margins and corner radius.
          </p>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="layoutFullWidth">Full width layout</Label>
              <p className="text-xs text-muted-foreground">Edge-to-edge site with no side margin or rounded corners</p>
            </div>
            <Switch
              id="layoutFullWidth"
              checked={form.layoutFullWidth ?? false}
              onCheckedChange={(v) => set("layoutFullWidth", v)}
            />
          </div>
          {!form.layoutFullWidth && (
            <div className="space-y-2">
              <Label htmlFor="layoutMargin">
                Side margin ({form.layoutMargin ?? DEFAULT_LAYOUT_MARGIN}px)
              </Label>
              <input
                id="layoutMargin"
                type="range"
                min={MIN_LAYOUT_MARGIN}
                max={MAX_LAYOUT_MARGIN}
                step={4}
                value={form.layoutMargin ?? DEFAULT_LAYOUT_MARGIN}
                onChange={(e) => set("layoutMargin", Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{MIN_LAYOUT_MARGIN}px (wide)</span>
                <span>{MAX_LAYOUT_MARGIN}px (narrow)</span>
              </div>
            </div>
          )}
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
