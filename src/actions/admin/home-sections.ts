"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/session"
import { requireAdminMutation } from "@/lib/admin-mutation"
import { auditLog } from "@/lib/audit"
import {
  homeIntroSchema,
  featuredServiceSchema,
  successStatSchema,
  activitySchema,
  testimonialSchema,
} from "@/lib/validations/cms"
import { archiveContent } from "@/actions/admin/archive"
import { archiveIfExists, getNextSortOrder, normalizeBilingualCmsData, revalidatePublicSite } from "@/lib/cms-helpers"
import { CMS_TABLES } from "@/lib/cms-tables"
import { syncFeaturedServicesToServicePages } from "@/lib/sync-services"

export async function getHomeIntroAdmin() {
  await requireAdmin()
  return prisma.homeIntro.findFirst()
}

export async function updateHomeIntro(csrfToken: string, data: unknown) {
  const { ip } = await requireAdminMutation(csrfToken)
  const parsed = homeIntroSchema.parse(data)
  const existing = await prisma.homeIntro.findFirst()
  await archiveIfExists(CMS_TABLES.HomeIntro, existing)
  const result = await prisma.homeIntro.upsert({
    where: { id: existing?.id ?? 1 },
    create: { id: 1, ...parsed },
    update: parsed,
  })
  await auditLog("home_intro_update", "Updated home intro", ip)
  revalidatePublicSite()
  return result
}

export async function getFeaturedServicesAdmin() {
  await requireAdmin()
  return prisma.featuredService.findMany({ orderBy: { sortOrder: "asc" } })
}

const FEATURED_BILINGUAL_PAIRS = [
  ["titleEn", "titleBn"],
  ["descriptionEn", "descriptionBn"],
] as const satisfies ReadonlyArray<readonly [string, string]>

export async function createFeaturedService(csrfToken: string, data: unknown) {
  const { ip } = await requireAdminMutation(csrfToken)
  const sortOrder = await getNextSortOrder(() => prisma.featuredService.findMany({ select: { sortOrder: true } }))
  const normalized = normalizeBilingualCmsData(data, [...FEATURED_BILINGUAL_PAIRS])
  const parsed = featuredServiceSchema.parse({ ...normalized, sortOrder })
  const item = await prisma.featuredService.create({ data: parsed })
  await syncFeaturedServicesToServicePages()
  await auditLog("featured_service_create", `Created featured service ${item.id}`, ip)
  revalidatePublicSite()
  return item
}

export async function updateFeaturedService(csrfToken: string, id: number, data: unknown) {
  const { ip } = await requireAdminMutation(csrfToken)
  const existing = await prisma.featuredService.findUnique({ where: { id } })
  if (!existing) throw new Error("Not found")
  await archiveIfExists(CMS_TABLES.FeaturedService, existing)
  const normalized = normalizeBilingualCmsData(data, [...FEATURED_BILINGUAL_PAIRS])
  const parsed = featuredServiceSchema.partial().parse(normalized)
  const item = await prisma.featuredService.update({ where: { id }, data: parsed })
  await syncFeaturedServicesToServicePages()
  await auditLog("featured_service_update", `Updated featured service ${id}`, ip)
  revalidatePublicSite()
  return item
}

export async function toggleFeaturedServiceStatus(csrfToken: string, id: number, status: string) {
  await requireAdminMutation(csrfToken)
  await prisma.featuredService.update({ where: { id }, data: { status } })
  revalidatePublicSite()
}

export async function archiveFeaturedService(csrfToken: string, id: number) {
  await requireAdminMutation(csrfToken)
  const existing = await prisma.featuredService.findUnique({ where: { id } })
  if (!existing) throw new Error("Not found")
  await archiveContent(CMS_TABLES.FeaturedService, id, existing)
  await prisma.featuredService.delete({ where: { id } })
  revalidatePublicSite()
}

export async function deleteFeaturedService(csrfToken: string, id: number) {
  await requireAdminMutation(csrfToken)
  const existing = await prisma.featuredService.findUnique({ where: { id } })
  if (existing) await archiveContent(CMS_TABLES.FeaturedService, id, existing)
  await prisma.featuredService.delete({ where: { id } })
  revalidatePublicSite()
}

export async function getSuccessStatsAdmin() {
  await requireAdmin()
  return prisma.successStat.findMany({ orderBy: { id: "asc" } })
}

export async function createSuccessStat(csrfToken: string, data: unknown) {
  await requireAdminMutation(csrfToken)
  const parsed = successStatSchema.parse(data)
  const item = await prisma.successStat.create({ data: parsed })
  revalidatePublicSite()
  return item
}

export async function updateSuccessStat(csrfToken: string, id: number, data: unknown) {
  await requireAdminMutation(csrfToken)
  const existing = await prisma.successStat.findUnique({ where: { id } })
  if (!existing) throw new Error("Not found")
  await archiveIfExists(CMS_TABLES.SuccessStat, existing)
  const parsed = successStatSchema.partial().parse(data)
  const item = await prisma.successStat.update({ where: { id }, data: parsed })
  revalidatePublicSite()
  return item
}

export async function toggleSuccessStatStatus(csrfToken: string, id: number, status: string) {
  await requireAdminMutation(csrfToken)
  await prisma.successStat.update({ where: { id }, data: { status } })
  revalidatePublicSite()
}

export async function archiveSuccessStat(csrfToken: string, id: number) {
  await requireAdminMutation(csrfToken)
  const existing = await prisma.successStat.findUnique({ where: { id } })
  if (!existing) throw new Error("Not found")
  await archiveContent(CMS_TABLES.SuccessStat, id, existing)
  await prisma.successStat.delete({ where: { id } })
  revalidatePublicSite()
}

export async function deleteSuccessStat(csrfToken: string, id: number) {
  await requireAdminMutation(csrfToken)
  const existing = await prisma.successStat.findUnique({ where: { id } })
  if (existing) await archiveContent(CMS_TABLES.SuccessStat, id, existing)
  await prisma.successStat.delete({ where: { id } })
  revalidatePublicSite()
}

export async function getActivitiesAdmin() {
  await requireAdmin()
  return prisma.activity.findMany({ orderBy: { id: "asc" } })
}

export async function createActivity(csrfToken: string, data: unknown) {
  await requireAdminMutation(csrfToken)
  const parsed = activitySchema.parse(data)
  const item = await prisma.activity.create({ data: parsed })
  revalidatePublicSite()
  return item
}

export async function updateActivity(csrfToken: string, id: number, data: unknown) {
  await requireAdminMutation(csrfToken)
  const existing = await prisma.activity.findUnique({ where: { id } })
  if (!existing) throw new Error("Not found")
  await archiveIfExists(CMS_TABLES.Activity, existing)
  const parsed = activitySchema.partial().parse(data)
  const item = await prisma.activity.update({ where: { id }, data: parsed })
  revalidatePublicSite()
  return item
}

export async function toggleActivityStatus(csrfToken: string, id: number, status: string) {
  await requireAdminMutation(csrfToken)
  await prisma.activity.update({ where: { id }, data: { status } })
  revalidatePublicSite()
}

export async function archiveActivity(csrfToken: string, id: number) {
  await requireAdminMutation(csrfToken)
  const existing = await prisma.activity.findUnique({ where: { id } })
  if (!existing) throw new Error("Not found")
  await archiveContent(CMS_TABLES.Activity, id, existing)
  await prisma.activity.delete({ where: { id } })
  revalidatePublicSite()
}

export async function deleteActivity(csrfToken: string, id: number) {
  await requireAdminMutation(csrfToken)
  const existing = await prisma.activity.findUnique({ where: { id } })
  if (existing) await archiveContent(CMS_TABLES.Activity, id, existing)
  await prisma.activity.delete({ where: { id } })
  revalidatePublicSite()
}

export async function getTestimonialsAdmin() {
  await requireAdmin()
  return prisma.testimonial.findMany({ orderBy: { id: "asc" } })
}

export async function createTestimonial(csrfToken: string, data: unknown) {
  await requireAdminMutation(csrfToken)
  const parsed = testimonialSchema.parse(data)
  const item = await prisma.testimonial.create({ data: parsed })
  revalidatePublicSite()
  return item
}

export async function updateTestimonial(csrfToken: string, id: number, data: unknown) {
  await requireAdminMutation(csrfToken)
  const existing = await prisma.testimonial.findUnique({ where: { id } })
  if (!existing) throw new Error("Not found")
  await archiveIfExists(CMS_TABLES.Testimonial, existing)
  const parsed = testimonialSchema.partial().parse(data)
  const item = await prisma.testimonial.update({ where: { id }, data: parsed })
  revalidatePublicSite()
  return item
}

export async function toggleTestimonialStatus(csrfToken: string, id: number, status: string) {
  await requireAdminMutation(csrfToken)
  await prisma.testimonial.update({ where: { id }, data: { status } })
  revalidatePublicSite()
}

export async function archiveTestimonial(csrfToken: string, id: number) {
  await requireAdminMutation(csrfToken)
  const existing = await prisma.testimonial.findUnique({ where: { id } })
  if (!existing) throw new Error("Not found")
  await archiveContent(CMS_TABLES.Testimonial, id, existing)
  await prisma.testimonial.delete({ where: { id } })
  revalidatePublicSite()
}

export async function deleteTestimonial(csrfToken: string, id: number) {
  await requireAdminMutation(csrfToken)
  const existing = await prisma.testimonial.findUnique({ where: { id } })
  if (existing) await archiveContent(CMS_TABLES.Testimonial, id, existing)
  await prisma.testimonial.delete({ where: { id } })
  revalidatePublicSite()
}
