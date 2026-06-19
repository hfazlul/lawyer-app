"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BilingualInput } from "@/components/admin/bilingual-input"
import { ImageUpload } from "@/components/admin/image-upload"
import { CmsItemActions } from "@/components/admin/cms-item-actions"
import {
  createHeroSlide, updateHeroSlide, toggleHeroSlideStatus, archiveHeroSlide, deleteHeroSlide,
} from "@/actions/admin/hero-slides"
import {
  updateHomeIntro,
  createFeaturedService, updateFeaturedService, toggleFeaturedServiceStatus, archiveFeaturedService, deleteFeaturedService,
  createSuccessStat, updateSuccessStat, toggleSuccessStatStatus, archiveSuccessStat, deleteSuccessStat,
  createActivity, updateActivity, toggleActivityStatus, archiveActivity, deleteActivity,
  createTestimonial, updateTestimonial, toggleTestimonialStatus, archiveTestimonial, deleteTestimonial,
} from "@/actions/admin/home-sections"
import { useCsrf } from "@/components/admin/csrf-provider"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import type { HeroSlide, HomeIntro, FeaturedService, SuccessStat, Activity, Testimonial } from "@prisma/client"

interface HomeCmsProps {
  slides: HeroSlide[]
  intro: HomeIntro | null
  featured: FeaturedService[]
  stats: SuccessStat[]
  activities: Activity[]
  testimonials: Testimonial[]
}

export function HomeCms({ slides, intro, featured, stats, activities, testimonials }: HomeCmsProps) {
  const router = useRouter()
  const csrf = useCsrf()
  const [isPending, startTransition] = useTransition()
  const [introForm, setIntroForm] = useState({
    titleEn: intro?.titleEn ?? "",
    titleBn: intro?.titleBn ?? "",
    descriptionEn: intro?.descriptionEn ?? "",
    descriptionBn: intro?.descriptionBn ?? "",
    lawyerImage: intro?.lawyerImage ?? "",
    degreeImage: intro?.degreeImage ?? "",
    ctaTextEn: intro?.ctaTextEn ?? "",
    ctaTextBn: intro?.ctaTextBn ?? "",
    ctaLink: intro?.ctaLink ?? "",
  })

  const saveIntro = () => {
    startTransition(async () => {
      try {
        await updateHomeIntro(csrf, introForm)
        toast.success("Welcome section saved")
        router.refresh()
      } catch {
        toast.error("Save failed")
      }
    })
  }

  // Hero slides state
  const [slideForm, setSlideForm] = useState<Record<string, string>>({})
  const [editingSlide, setEditingSlide] = useState<number | null>(null)
  const [showSlideForm, setShowSlideForm] = useState(false)

  const saveSlide = () => {
    startTransition(async () => {
      try {
        if (editingSlide) {
          await updateHeroSlide(csrf, editingSlide, slideForm)
          toast.success("Slide updated")
        } else {
          await createHeroSlide(csrf, slideForm)
          toast.success("Slide created")
        }
        setShowSlideForm(false)
        setEditingSlide(null)
        setSlideForm({})
        router.refresh()
      } catch {
        toast.error("Save failed")
      }
    })
  }

  return (
    <Tabs defaultValue="hero">
      <TabsList className="flex flex-wrap h-auto">
        <TabsTrigger value="hero">Hero Slides</TabsTrigger>
        <TabsTrigger value="intro">Welcome</TabsTrigger>
        <TabsTrigger value="featured">Featured Services</TabsTrigger>
        <TabsTrigger value="stats">Success Stats</TabsTrigger>
        <TabsTrigger value="activities">Activities</TabsTrigger>
        <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
      </TabsList>

      <TabsContent value="hero" className="space-y-4">
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { setShowSlideForm(true); setEditingSlide(null); setSlideForm({}) }}>
            <Plus className="mr-2 h-4 w-4" />Add Slide
          </Button>
        </div>
        {(showSlideForm || editingSlide) && (
          <div className="rounded-lg border p-4 space-y-4">
            <BilingualInput label="Title" enName="titleEn" bnName="titleBn"
              enValue={slideForm.titleEn ?? ""} bnValue={slideForm.titleBn ?? ""}
              onEnChange={(v) => setSlideForm((f) => ({ ...f, titleEn: v }))}
              onBnChange={(v) => setSlideForm((f) => ({ ...f, titleBn: v }))} required />
            <BilingualInput label="Description" enName="descriptionEn" bnName="descriptionBn"
              enValue={slideForm.descriptionEn ?? ""} bnValue={slideForm.descriptionBn ?? ""}
              onEnChange={(v) => setSlideForm((f) => ({ ...f, descriptionEn: v }))}
              onBnChange={(v) => setSlideForm((f) => ({ ...f, descriptionBn: v }))} multiline />
            <ImageUpload label="Slide Image" value={slideForm.image ?? ""} onChange={(v) => setSlideForm((f) => ({ ...f, image: v }))} required />
            <BilingualInput label="CTA Text" enName="ctaTextEn" bnName="ctaTextBn"
              enValue={slideForm.ctaTextEn ?? ""} bnValue={slideForm.ctaTextBn ?? ""}
              onEnChange={(v) => setSlideForm((f) => ({ ...f, ctaTextEn: v }))}
              onBnChange={(v) => setSlideForm((f) => ({ ...f, ctaTextBn: v }))} />
            <div className="space-y-2">
              <Label>CTA Link</Label>
              <Input value={slideForm.ctaLink ?? ""} onChange={(e) => setSlideForm((f) => ({ ...f, ctaLink: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={saveSlide} disabled={isPending}>{editingSlide ? "Update" : "Create"}</Button>
              <Button size="sm" variant="outline" onClick={() => { setShowSlideForm(false); setEditingSlide(null) }}>Cancel</Button>
            </div>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Image</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slides.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.titleEn}</TableCell>
                <TableCell className="font-mono text-xs">{s.image}</TableCell>
                <TableCell className="text-right">
                  <CmsItemActions
                    id={s.id}
                    status={s.status}
                    onEdit={() => {
                      setEditingSlide(s.id)
                      setShowSlideForm(true)
                      setSlideForm({
                        titleEn: s.titleEn, titleBn: s.titleBn,
                        descriptionEn: s.descriptionEn, descriptionBn: s.descriptionBn,
                        image: s.image, ctaTextEn: s.ctaTextEn ?? "", ctaTextBn: s.ctaTextBn ?? "",
                        ctaLink: s.ctaLink ?? "",
                      })
                    }}
                    onToggleStatus={toggleHeroSlideStatus}
                    onArchive={archiveHeroSlide}
                    onDelete={deleteHeroSlide}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="intro" className="space-y-4">
        <BilingualInput label="Title" enName="titleEn" bnName="titleBn"
          enValue={introForm.titleEn} bnValue={introForm.titleBn}
          onEnChange={(v) => setIntroForm((f) => ({ ...f, titleEn: v }))}
          onBnChange={(v) => setIntroForm((f) => ({ ...f, titleBn: v }))} required />
        <BilingualInput label="Description" enName="descriptionEn" bnName="descriptionBn"
          enValue={introForm.descriptionEn} bnValue={introForm.descriptionBn}
          onEnChange={(v) => setIntroForm((f) => ({ ...f, descriptionEn: v }))}
          onBnChange={(v) => setIntroForm((f) => ({ ...f, descriptionBn: v }))} multiline />
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageUpload label="Lawyer Photo" value={introForm.lawyerImage} onChange={(v) => setIntroForm((f) => ({ ...f, lawyerImage: v }))} />
          <ImageUpload label="Degree Image" value={introForm.degreeImage} onChange={(v) => setIntroForm((f) => ({ ...f, degreeImage: v }))} />
        </div>
        <BilingualInput label="CTA Text" enName="ctaTextEn" bnName="ctaTextBn"
          enValue={introForm.ctaTextEn} bnValue={introForm.ctaTextBn}
          onEnChange={(v) => setIntroForm((f) => ({ ...f, ctaTextEn: v }))}
          onBnChange={(v) => setIntroForm((f) => ({ ...f, ctaTextBn: v }))} />
        <div className="space-y-2">
          <Label>CTA Link</Label>
          <Input value={introForm.ctaLink} onChange={(e) => setIntroForm((f) => ({ ...f, ctaLink: e.target.value }))} />
        </div>
        <Button onClick={saveIntro} disabled={isPending}>Save Welcome Section</Button>
      </TabsContent>

      <TabsContent value="featured">
        <FeaturedList items={featured} />
      </TabsContent>
      <TabsContent value="stats">
        <StatsList items={stats} />
      </TabsContent>
      <TabsContent value="activities">
        <ActivitiesList items={activities} />
      </TabsContent>
      <TabsContent value="testimonials">
        <TestimonialsList items={testimonials} />
      </TabsContent>
    </Tabs>
  )
}

function FeaturedList({ items }: { items: FeaturedService[] }) {
  const router = useRouter()
  const csrf = useCsrf()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const save = () => {
    startTransition(async () => {
      try {
        if (editingId) await updateFeaturedService(csrf, editingId, form)
        else await createFeaturedService(csrf, form)
        toast.success("Saved")
        setShowForm(false); setEditingId(null); setForm({})
        router.refresh()
      } catch { toast.error("Save failed") }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setShowForm(true); setEditingId(null); setForm({}) }}><Plus className="mr-2 h-4 w-4" />Add</Button>
      </div>
      {(showForm || editingId) && (
        <div className="rounded-lg border p-4 space-y-4">
          <ImageUpload label="Icon" value={form.icon ?? ""} onChange={(v) => setForm((f) => ({ ...f, icon: v }))} />
          <BilingualInput label="Title" enName="titleEn" bnName="titleBn" enValue={form.titleEn ?? ""} bnValue={form.titleBn ?? ""}
            onEnChange={(v) => setForm((f) => ({ ...f, titleEn: v }))} onBnChange={(v) => setForm((f) => ({ ...f, titleBn: v }))} required />
          <BilingualInput label="Description" enName="descriptionEn" bnName="descriptionBn" enValue={form.descriptionEn ?? ""} bnValue={form.descriptionBn ?? ""}
            onEnChange={(v) => setForm((f) => ({ ...f, descriptionEn: v }))} onBnChange={(v) => setForm((f) => ({ ...f, descriptionBn: v }))} multiline />
          <div className="space-y-2"><Label>Link to Service</Label><Input value={form.linkToService ?? ""} onChange={(e) => setForm((f) => ({ ...f, linkToService: e.target.value }))} /></div>
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={isPending}>{editingId ? "Update" : "Create"}</Button>
            <Button size="sm" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</Button>
          </div>
        </div>
      )}
      <Table>
        <TableHeader><TableRow><TableHead>Title</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.titleEn}</TableCell>
              <TableCell className="text-right">
                <CmsItemActions id={item.id} status={item.status}
                  onEdit={() => { setEditingId(item.id); setShowForm(true); setForm({ titleEn: item.titleEn, titleBn: item.titleBn, descriptionEn: item.descriptionEn, descriptionBn: item.descriptionBn, icon: item.icon ?? "", linkToService: item.linkToService ?? "" }) }}
                  onToggleStatus={toggleFeaturedServiceStatus} onArchive={archiveFeaturedService} onDelete={deleteFeaturedService} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function StatsList({ items }: { items: SuccessStat[] }) {
  const router = useRouter()
  const csrf = useCsrf()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<Record<string, string | number>>({ number: 0, titleEn: "", titleBn: "" })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const save = () => {
    startTransition(async () => {
      try {
        const data = { ...form, number: Number(form.number) }
        if (editingId) await updateSuccessStat(csrf, editingId, data)
        else await createSuccessStat(csrf, data)
        toast.success("Saved"); setShowForm(false); setEditingId(null); router.refresh()
      } catch { toast.error("Save failed") }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button size="sm" onClick={() => { setShowForm(true); setEditingId(null); setForm({ number: 0, titleEn: "", titleBn: "" }) }}><Plus className="mr-2 h-4 w-4" />Add</Button></div>
      {(showForm || editingId) && (
        <div className="rounded-lg border p-4 space-y-4">
          <div className="space-y-2"><Label>Number</Label><Input type="number" value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} /></div>
          <BilingualInput label="Title" enName="titleEn" bnName="titleBn" enValue={String(form.titleEn)} bnValue={String(form.titleBn)}
            onEnChange={(v) => setForm((f) => ({ ...f, titleEn: v }))} onBnChange={(v) => setForm((f) => ({ ...f, titleBn: v }))} required />
          <div className="flex gap-2"><Button size="sm" onClick={save} disabled={isPending}>{editingId ? "Update" : "Create"}</Button><Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </div>
      )}
      <Table>
        <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Title</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.number}</TableCell>
              <TableCell>{item.titleEn}</TableCell>
              <TableCell className="text-right">
                <CmsItemActions id={item.id} status={item.status}
                  onEdit={() => { setEditingId(item.id); setShowForm(true); setForm({ number: item.number, titleEn: item.titleEn, titleBn: item.titleBn }) }}
                  onToggleStatus={toggleSuccessStatStatus} onArchive={archiveSuccessStat} onDelete={deleteSuccessStat} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ActivitiesList({ items }: { items: Activity[] }) {
  const router = useRouter()
  const csrf = useCsrf()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const save = () => {
    startTransition(async () => {
      try {
        if (editingId) await updateActivity(csrf, editingId, form)
        else await createActivity(csrf, form)
        toast.success("Saved"); setShowForm(false); setEditingId(null); router.refresh()
      } catch { toast.error("Save failed") }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button size="sm" onClick={() => { setShowForm(true); setEditingId(null); setForm({}) }}><Plus className="mr-2 h-4 w-4" />Add</Button></div>
      {(showForm || editingId) && (
        <div className="rounded-lg border p-4 space-y-4">
          <ImageUpload label="Image" value={form.image ?? ""} onChange={(v) => setForm((f) => ({ ...f, image: v }))} required />
          <BilingualInput label="Title" enName="titleEn" bnName="titleBn" enValue={form.titleEn ?? ""} bnValue={form.titleBn ?? ""}
            onEnChange={(v) => setForm((f) => ({ ...f, titleEn: v }))} onBnChange={(v) => setForm((f) => ({ ...f, titleBn: v }))} required />
          <BilingualInput label="Caption" enName="captionEn" bnName="captionBn" enValue={form.captionEn ?? ""} bnValue={form.captionBn ?? ""}
            onEnChange={(v) => setForm((f) => ({ ...f, captionEn: v }))} onBnChange={(v) => setForm((f) => ({ ...f, captionBn: v }))} />
          <div className="flex gap-2"><Button size="sm" onClick={save} disabled={isPending}>{editingId ? "Update" : "Create"}</Button><Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </div>
      )}
      <Table>
        <TableHeader><TableRow><TableHead>Title</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.titleEn}</TableCell>
              <TableCell className="text-right">
                <CmsItemActions id={item.id} status={item.status}
                  onEdit={() => { setEditingId(item.id); setShowForm(true); setForm({ image: item.image, titleEn: item.titleEn, titleBn: item.titleBn, captionEn: item.captionEn ?? "", captionBn: item.captionBn ?? "" }) }}
                  onToggleStatus={toggleActivityStatus} onArchive={archiveActivity} onDelete={deleteActivity} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function TestimonialsList({ items }: { items: Testimonial[] }) {
  const router = useRouter()
  const csrf = useCsrf()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<Record<string, string | number>>({ clientName: "", reviewEn: "", reviewBn: "", rating: 5 })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const save = () => {
    startTransition(async () => {
      try {
        const data = { ...form, rating: Number(form.rating) }
        if (editingId) await updateTestimonial(csrf, editingId, data)
        else await createTestimonial(csrf, data)
        toast.success("Saved"); setShowForm(false); setEditingId(null); router.refresh()
      } catch { toast.error("Save failed") }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button size="sm" onClick={() => { setShowForm(true); setEditingId(null); setForm({ clientName: "", reviewEn: "", reviewBn: "", rating: 5 }) }}><Plus className="mr-2 h-4 w-4" />Add</Button></div>
      {(showForm || editingId) && (
        <div className="rounded-lg border p-4 space-y-4">
          <div className="space-y-2"><Label>Client Name</Label><Input value={String(form.clientName)} onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))} /></div>
          <BilingualInput label="Review" enName="reviewEn" bnName="reviewBn" enValue={String(form.reviewEn)} bnValue={String(form.reviewBn)}
            onEnChange={(v) => setForm((f) => ({ ...f, reviewEn: v }))} onBnChange={(v) => setForm((f) => ({ ...f, reviewBn: v }))} multiline required />
          <div className="space-y-2"><Label>Rating (1-5)</Label><Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))} /></div>
          <div className="flex gap-2"><Button size="sm" onClick={save} disabled={isPending}>{editingId ? "Update" : "Create"}</Button><Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </div>
      )}
      <Table>
        <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Rating</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.clientName}</TableCell>
              <TableCell>{item.rating}</TableCell>
              <TableCell className="text-right">
                <CmsItemActions id={item.id} status={item.status}
                  onEdit={() => { setEditingId(item.id); setShowForm(true); setForm({ clientName: item.clientName, reviewEn: item.reviewEn, reviewBn: item.reviewBn, rating: item.rating }) }}
                  onToggleStatus={toggleTestimonialStatus} onArchive={archiveTestimonial} onDelete={deleteTestimonial} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
