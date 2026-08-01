"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/session"
import { requireAdminMutation } from "@/lib/admin-mutation"
import { auditLog } from "@/lib/audit"
import { appointmentSettingSchema } from "@/lib/validations/cms"
import { sanitizeMapFields } from "@/lib/map-embed"
import { archiveIfExists, revalidatePublicSite } from "@/lib/cms-helpers"
import { CMS_TABLES } from "@/lib/cms-tables"

export async function getAppointmentSettingsAdmin() {
  await requireAdmin()
  return prisma.appointmentSetting.findFirst()
}

export async function updateAppointmentSettings(csrfToken: string, data: unknown) {
  const { ip } = await requireAdminMutation(csrfToken)
  const parsed = sanitizeMapFields(appointmentSettingSchema.parse(data))
  const existing = await prisma.appointmentSetting.findFirst()
  await archiveIfExists(CMS_TABLES.AppointmentSetting, existing)
  const result = await prisma.appointmentSetting.upsert({
    where: { id: existing?.id ?? 1 },
    create: { id: 1, ...parsed },
    update: parsed,
  })
  await auditLog("appointment_settings_update", "Updated appointment settings", ip)
  revalidatePublicSite()
  return result
}
