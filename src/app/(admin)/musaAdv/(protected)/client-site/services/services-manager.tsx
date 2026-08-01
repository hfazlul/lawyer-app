"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BilingualInput } from "@/components/admin/bilingual-input"
import { ImageUpload } from "@/components/admin/image-upload"
import { CmsItemActions } from "@/components/admin/cms-item-actions"
import {
  createService, updateService, toggleServiceStatus, archiveService, deleteService,
} from "@/actions/admin/services"
import { getCmsErrorMessage } from "@/lib/cms-helpers"
import { useCsrf } from "@/components/admin/csrf-provider"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import type { ServicePage } from "@prisma/client"

export function ServicesManager({ services }: { services: ServicePage[] }) {
  const router = useRouter()
  const csrf = useCsrf()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const save = () => {
    startTransition(async () => {
      try {
        if (editingId) await updateService(csrf, editingId, form)
        else await createService(csrf, form)
        toast.success("Service saved")
        setShowForm(false); setEditingId(null); setForm({})
        router.refresh()
      } catch (err) {
        toast.error(getCmsErrorMessage(err))
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => { setShowForm(true); setEditingId(null); setForm({}) }}>
          <Plus className="mr-2 h-4 w-4" />Add Service
        </Button>
      </div>

      {(showForm || editingId) && (
        <div className="space-y-6 rounded-lg border p-4">
          <div className="space-y-4 rounded-lg border border-dashed bg-muted/20 p-4">
            <div>
              <h3 className="font-semibold">Detail Page Hero</h3>
              <p className="text-sm text-muted-foreground">
                Banner at the top of <code>/services/[id]</code>. Leave blank to use the card title.
              </p>
            </div>
            <BilingualInput
              label="Hero Title"
              enName="bannerTitleEn"
              bnName="bannerTitleBn"
              enValue={form.bannerTitleEn ?? ""}
              bnValue={form.bannerTitleBn ?? ""}
              onEnChange={(v) => setForm((f) => ({ ...f, bannerTitleEn: v }))}
              onBnChange={(v) => setForm((f) => ({ ...f, bannerTitleBn: v }))}
            />
            <BilingualInput
              label="Hero Subtitle"
              enName="bannerSubtitleEn"
              bnName="bannerSubtitleBn"
              enValue={form.bannerSubtitleEn ?? ""}
              bnValue={form.bannerSubtitleBn ?? ""}
              onEnChange={(v) => setForm((f) => ({ ...f, bannerSubtitleEn: v }))}
              onBnChange={(v) => setForm((f) => ({ ...f, bannerSubtitleBn: v }))}
              multiline
            />
          </div>

          <BilingualInput label="Card Title" enName="titleEn" bnName="titleBn"
            enValue={form.titleEn ?? ""} bnValue={form.titleBn ?? ""}
            onEnChange={(v) => setForm((f) => ({ ...f, titleEn: v }))}
            onBnChange={(v) => setForm((f) => ({ ...f, titleBn: v }))} required />
          <BilingualInput label="Full Content" enName="contentEn" bnName="contentBn"
            enValue={form.contentEn ?? ""} bnValue={form.contentBn ?? ""}
            onEnChange={(v) => setForm((f) => ({ ...f, contentEn: v }))}
            onBnChange={(v) => setForm((f) => ({ ...f, contentBn: v }))} multiline />
          <p className="-mt-2 text-xs text-muted-foreground">
            Full description on the detail page. Card text on home and services pages uses the first ~200 characters.
          </p>
          <ImageUpload
            label="Card Image"
            hint="Recommended: 600 × 400 px (semi-square). Shown at the top of the service card with rounded corners."
            value={form.icon ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, icon: v }))}
          />
          <div className="flex gap-2">
            <Button onClick={save} disabled={isPending}>{editingId ? "Update" : "Create"}</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</Button>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Icon</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.titleEn}</TableCell>
              <TableCell className="font-mono text-xs">{s.icon ?? "—"}</TableCell>
              <TableCell className="text-right">
                <CmsItemActions
                  id={s.id}
                  status={s.status}
                  onEdit={() => {
                    setEditingId(s.id)
                    setShowForm(true)
                    setForm({
                      titleEn: s.titleEn,
                      titleBn: s.titleBn,
                      contentEn: s.contentEn,
                      contentBn: s.contentBn,
                      icon: s.icon ?? "",
                      bannerTitleEn: s.bannerTitleEn ?? "",
                      bannerTitleBn: s.bannerTitleBn ?? "",
                      bannerSubtitleEn: s.bannerSubtitleEn ?? "",
                      bannerSubtitleBn: s.bannerSubtitleBn ?? "",
                    })
                  }}
                  onToggleStatus={toggleServiceStatus}
                  onArchive={archiveService}
                  onDelete={deleteService}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
