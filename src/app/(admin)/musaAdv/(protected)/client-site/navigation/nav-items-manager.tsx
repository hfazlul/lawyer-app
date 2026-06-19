"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BilingualInput } from "@/components/admin/bilingual-input"
import { CmsItemActions } from "@/components/admin/cms-item-actions"
import {
  createNavItem,
  updateNavItem,
  toggleNavItemStatus,
  archiveNavItem,
  deleteNavItem,
  reorderNavItems,
} from "@/actions/admin/nav-items"
import { useCsrf } from "@/components/admin/csrf-provider"
import { toast } from "sonner"
import { ArrowDown, ArrowUp, Plus } from "lucide-react"
import type { NavItem } from "@prisma/client"

type FormState = { labelEn: string; labelBn: string; href: string }

const emptyForm: FormState = { labelEn: "", labelBn: "", href: "/" }

export function NavItemsManager({ items }: { items: NavItem[] }) {
  const router = useRouter()
  const csrf = useCsrf()
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [showForm, setShowForm] = useState(false)

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false) }

  const handleSave = () => {
    startTransition(async () => {
      try {
        if (editingId) {
          await updateNavItem(csrf, editingId, form)
          toast.success("Nav item updated")
        } else {
          await createNavItem(csrf, form)
          toast.success("Nav item created")
        }
        resetForm()
        router.refresh()
      } catch {
        toast.error("Save failed")
      }
    })
  }

  const move = (index: number, direction: -1 | 1) => {
    const newOrder = [...items]
    const target = index + direction
    if (target < 0 || target >= newOrder.length) return
    ;[newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]]
    startTransition(async () => {
      await reorderNavItems(csrf, newOrder.map((i) => i.id))
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm) }}>
          <Plus className="mr-2 h-4 w-4" />Add Nav Item
        </Button>
      </div>

      {(showForm || editingId) && (
        <div className="rounded-lg border p-4 space-y-4">
          <BilingualInput label="Label" enName="labelEn" bnName="labelBn"
            enValue={form.labelEn} bnValue={form.labelBn}
            onEnChange={(v) => setForm((f) => ({ ...f, labelEn: v }))}
            onBnChange={(v) => setForm((f) => ({ ...f, labelBn: v }))} required />
          <div className="space-y-2">
            <Label>URL Path</Label>
            <Input value={form.href} onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))} placeholder="/services" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isPending}>{editingId ? "Update" : "Create"}</Button>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Label (EN)</TableHead>
            <TableHead>Label (BN)</TableHead>
            <TableHead>Path</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" disabled={idx === 0 || isPending} onClick={() => move(idx, -1)}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" disabled={idx === items.length - 1 || isPending} onClick={() => move(idx, 1)}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>{item.labelEn}</TableCell>
              <TableCell>{item.labelBn}</TableCell>
              <TableCell className="font-mono text-sm">{item.href}</TableCell>
              <TableCell className="text-right">
                <CmsItemActions
                  id={item.id}
                  status={item.status}
                  onEdit={() => {
                    setEditingId(item.id)
                    setShowForm(true)
                    setForm({ labelEn: item.labelEn, labelBn: item.labelBn, href: item.href })
                  }}
                  onToggleStatus={toggleNavItemStatus}
                  onArchive={archiveNavItem}
                  onDelete={deleteNavItem}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
