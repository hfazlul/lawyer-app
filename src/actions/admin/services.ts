"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/session"
import { requireAdminMutation } from "@/lib/admin-mutation"
import { auditLog } from "@/lib/audit"
import { servicePageSchema } from "@/lib/validations/cms"
import { archiveContent } from "@/actions/admin/archive"
import { archiveIfExists, getNextSortOrder, revalidatePublicSite } from "@/lib/cms-helpers"
import { CMS_TABLES } from "@/lib/cms-tables"

export async function getServicesAdmin() {
  await requireAdmin()
  return prisma.servicePage.findMany({ orderBy: { sortOrder: "asc" } })
}

export async function createService(csrfToken: string, data: unknown) {
  const { ip } = await requireAdminMutation(csrfToken)
  const sortOrder = await getNextSortOrder(() => prisma.servicePage.findMany({ select: { sortOrder: true } }))
  const parsed = servicePageSchema.parse({ ...(data as object), sortOrder })
  const item = await prisma.servicePage.create({ data: parsed })
  await auditLog("service_create", `Created service ${item.id}`, ip)
  revalidatePublicSite()
  return item
}

export async function updateService(csrfToken: string, id: number, data: unknown) {
  const { ip } = await requireAdminMutation(csrfToken)
  const existing = await prisma.servicePage.findUnique({ where: { id } })
  if (!existing) throw new Error("Not found")
  await archiveIfExists(CMS_TABLES.ServicePage, existing)
  const parsed = servicePageSchema.partial().parse(data)
  const item = await prisma.servicePage.update({ where: { id }, data: parsed })
  await auditLog("service_update", `Updated service ${id}`, ip)
  revalidatePublicSite()
  return item
}

export async function toggleServiceStatus(csrfToken: string, id: number, status: string) {
  await requireAdminMutation(csrfToken)
  await prisma.servicePage.update({ where: { id }, data: { status } })
  revalidatePublicSite()
}

export async function archiveService(csrfToken: string, id: number) {
  const { ip } = await requireAdminMutation(csrfToken)
  const existing = await prisma.servicePage.findUnique({ where: { id } })
  if (!existing) throw new Error("Not found")
  await archiveContent(CMS_TABLES.ServicePage, id, existing)
  await prisma.servicePage.delete({ where: { id } })
  await auditLog("service_archive", `Archived service ${id}`, ip)
  revalidatePublicSite()
}

export async function deleteService(csrfToken: string, id: number) {
  const { ip } = await requireAdminMutation(csrfToken)
  const existing = await prisma.servicePage.findUnique({ where: { id } })
  if (existing) await archiveContent(CMS_TABLES.ServicePage, id, existing)
  await prisma.servicePage.delete({ where: { id } })
  await auditLog("service_delete", `Deleted service ${id}`, ip)
  revalidatePublicSite()
}
