"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/session"
import { requireAdminMutation } from "@/lib/admin-mutation"
import { auditLog } from "@/lib/audit"
import { navItemSchema } from "@/lib/validations/cms"
import { archiveContent } from "@/actions/admin/archive"
import { archiveIfExists, getNextSortOrder, revalidatePublicSite } from "@/lib/cms-helpers"
import { CMS_TABLES } from "@/lib/cms-tables"

export async function getNavItemsAdmin() {
  await requireAdmin()
  return prisma.navItem.findMany({ orderBy: { sortOrder: "asc" } })
}

export async function createNavItem(csrfToken: string, data: unknown) {
  const { ip } = await requireAdminMutation(csrfToken)
  const sortOrder = await getNextSortOrder(() => prisma.navItem.findMany({ select: { sortOrder: true } }))
  const parsed = navItemSchema.parse({ ...(data as object), sortOrder })
  const item = await prisma.navItem.create({ data: parsed })
  await auditLog("nav_item_create", `Created nav item ${item.id}`, ip)
  revalidatePublicSite()
  return item
}

export async function updateNavItem(csrfToken: string, id: number, data: unknown) {
  const { ip } = await requireAdminMutation(csrfToken)
  const existing = await prisma.navItem.findUnique({ where: { id } })
  if (!existing) throw new Error("Not found")
  await archiveIfExists(CMS_TABLES.NavItem, existing)
  const parsed = navItemSchema.partial().parse(data)
  const item = await prisma.navItem.update({ where: { id }, data: parsed })
  await auditLog("nav_item_update", `Updated nav item ${id}`, ip)
  revalidatePublicSite()
  return item
}

export async function toggleNavItemStatus(csrfToken: string, id: number, status: string) {
  await requireAdminMutation(csrfToken)
  await prisma.navItem.update({ where: { id }, data: { status } })
  revalidatePublicSite()
}

export async function archiveNavItem(csrfToken: string, id: number) {
  const { ip } = await requireAdminMutation(csrfToken)
  const existing = await prisma.navItem.findUnique({ where: { id } })
  if (!existing) throw new Error("Not found")
  await archiveContent(CMS_TABLES.NavItem, id, existing)
  await prisma.navItem.delete({ where: { id } })
  await auditLog("nav_item_archive", `Archived nav item ${id}`, ip)
  revalidatePublicSite()
}

export async function deleteNavItem(csrfToken: string, id: number) {
  const { ip } = await requireAdminMutation(csrfToken)
  const existing = await prisma.navItem.findUnique({ where: { id } })
  if (existing) await archiveContent(CMS_TABLES.NavItem, id, existing)
  await prisma.navItem.delete({ where: { id } })
  await auditLog("nav_item_delete", `Deleted nav item ${id}`, ip)
  revalidatePublicSite()
}

export async function reorderNavItems(csrfToken: string, orderedIds: number[]) {
  await requireAdminMutation(csrfToken)
  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.navItem.update({ where: { id }, data: { sortOrder: index + 1 } })
    )
  )
  revalidatePublicSite()
}
