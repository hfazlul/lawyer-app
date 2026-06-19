"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/session"
import { requireAdminMutation } from "@/lib/admin-mutation"
import { auditLog } from "@/lib/audit"
import { archiveContent } from "@/actions/admin/archive"
import { archiveIfExists, getNextSortOrder, revalidatePublicSite } from "@/lib/cms-helpers"
import { CMS_TABLES } from "@/lib/cms-tables"
import { heroSlideSchema } from "@/lib/validations/cms"

export async function getHeroSlidesAdmin() {
  await requireAdmin()
  return prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } })
}

export async function createHeroSlide(csrfToken: string, data: unknown) {
  const { ip } = await requireAdminMutation(csrfToken)
  const sortOrder = await getNextSortOrder(() => prisma.heroSlide.findMany({ select: { sortOrder: true } }))
  const parsed = heroSlideSchema.parse({ ...(data as object), sortOrder })
  const slide = await prisma.heroSlide.create({ data: parsed })
  await auditLog("hero_slide_create", `Created slide ${slide.id}`, ip)
  revalidatePublicSite()
  return slide
}

export async function updateHeroSlide(csrfToken: string, id: number, data: unknown) {
  const { ip } = await requireAdminMutation(csrfToken)
  const existing = await prisma.heroSlide.findUnique({ where: { id } })
  if (!existing) throw new Error("Not found")
  await archiveIfExists(CMS_TABLES.HeroSlide, existing)
  const parsed = heroSlideSchema.partial().parse(data)
  const slide = await prisma.heroSlide.update({ where: { id }, data: parsed })
  await auditLog("hero_slide_update", `Updated slide ${id}`, ip)
  revalidatePublicSite()
  return slide
}

export async function toggleHeroSlideStatus(csrfToken: string, id: number, status: string) {
  await requireAdminMutation(csrfToken)
  await prisma.heroSlide.update({ where: { id }, data: { status } })
  revalidatePublicSite()
}

export async function archiveHeroSlide(csrfToken: string, id: number) {
  const { ip } = await requireAdminMutation(csrfToken)
  const existing = await prisma.heroSlide.findUnique({ where: { id } })
  if (!existing) throw new Error("Not found")
  await archiveContent(CMS_TABLES.HeroSlide, id, existing)
  await prisma.heroSlide.delete({ where: { id } })
  await auditLog("hero_slide_archive", `Archived slide ${id}`, ip)
  revalidatePublicSite()
}

export async function deleteHeroSlide(csrfToken: string, id: number) {
  const { ip } = await requireAdminMutation(csrfToken)
  const existing = await prisma.heroSlide.findUnique({ where: { id } })
  if (existing) await archiveContent(CMS_TABLES.HeroSlide, id, existing)
  await prisma.heroSlide.delete({ where: { id } })
  await auditLog("hero_slide_delete", `Deleted slide ${id}`, ip)
  revalidatePublicSite()
}
