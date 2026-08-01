"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/session"
import { requireAdminMutation } from "@/lib/admin-mutation"
import { auditLog } from "@/lib/audit"
import { contactSettingSchema } from "@/lib/validations/cms"
import { sanitizeMapFields } from "@/lib/map-embed"
import { archiveIfExists, revalidatePublicSite } from "@/lib/cms-helpers"
import { CMS_TABLES } from "@/lib/cms-tables"

export async function getContactSettingsAdmin() {
  await requireAdmin()
  return prisma.contactSetting.findFirst()
}

export async function updateContactSettings(csrfToken: string, data: unknown) {
  const { ip } = await requireAdminMutation(csrfToken)
  const parsed = sanitizeMapFields(contactSettingSchema.parse(data))
  const existing = await prisma.contactSetting.findFirst()
  await archiveIfExists(CMS_TABLES.ContactSetting, existing)
  const result = await prisma.contactSetting.upsert({
    where: { id: existing?.id ?? 1 },
    create: { id: 1, ...parsed },
    update: parsed,
  })
  await auditLog("contact_settings_update", "Updated contact settings", ip)
  revalidatePublicSite()
  return result
}
