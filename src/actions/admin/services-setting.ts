"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/session"
import { requireAdminMutation } from "@/lib/admin-mutation"
import { auditLog } from "@/lib/audit"
import { servicesSettingSchema } from "@/lib/validations/cms"
import { archiveIfExists, revalidatePublicSite } from "@/lib/cms-helpers"
import { CMS_TABLES } from "@/lib/cms-tables"

export async function getServicesSettingAdmin() {
  await requireAdmin()
  return prisma.servicesSetting.findFirst()
}

export async function updateServicesSetting(csrfToken: string, data: unknown) {
  const { ip } = await requireAdminMutation(csrfToken)
  const parsed = servicesSettingSchema.parse(data)
  const existing = await prisma.servicesSetting.findFirst()
  await archiveIfExists(CMS_TABLES.ServicesSetting, existing)
  const result = await prisma.servicesSetting.upsert({
    where: { id: existing?.id ?? 1 },
    create: { id: 1, ...parsed },
    update: parsed,
  })
  await auditLog("services_setting_update", "Updated services listing hero", ip)
  revalidatePublicSite()
  return result
}
