"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/session"
import { requireAdminMutation } from "@/lib/admin-mutation"
import { auditLog } from "@/lib/audit"
import { siteSettingSchema } from "@/lib/validations/cms"
import { archiveContent } from "@/actions/admin/archive"
import { archiveIfExists, revalidatePublicSite } from "@/lib/cms-helpers"
import { CMS_TABLES } from "@/lib/cms-tables"

export async function getSiteSettingsAdmin() {
  await requireAdmin()
  return prisma.siteSetting.findFirst()
}

export async function updateSiteSettings(csrfToken: string, data: unknown) {
  const { ip } = await requireAdminMutation(csrfToken)
  const parsed = siteSettingSchema.parse(data)
  const existing = await prisma.siteSetting.findFirst()
  await archiveIfExists(CMS_TABLES.SiteSetting, existing)

  const result = await prisma.siteSetting.upsert({
    where: { id: existing?.id ?? 1 },
    create: { id: 1, ...parsed },
    update: parsed,
  })

  await auditLog("site_settings_update", "Updated site settings", ip)
  revalidatePublicSite()
  return result
}

export async function archiveSiteSettings(csrfToken: string) {
  const { ip } = await requireAdminMutation(csrfToken)
  const existing = await prisma.siteSetting.findFirst()
  if (!existing) throw new Error("No settings to archive")
  await archiveContent(CMS_TABLES.SiteSetting, existing.id, existing)
  await auditLog("site_settings_archive", "Archived site settings", ip)
  return { success: true }
}
