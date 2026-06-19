"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/session"
import { requireAdminMutation } from "@/lib/admin-mutation"
import { auditLog } from "@/lib/audit"
import { aboutPageSchema } from "@/lib/validations/cms"
import { archiveIfExists, revalidatePublicSite } from "@/lib/cms-helpers"
import { CMS_TABLES } from "@/lib/cms-tables"

export async function getAboutPageAdmin() {
  await requireAdmin()
  return prisma.aboutPage.findFirst()
}

export async function updateAboutPage(csrfToken: string, data: unknown) {
  const { ip } = await requireAdminMutation(csrfToken)
  const parsed = aboutPageSchema.parse(data)
  const existing = await prisma.aboutPage.findFirst()
  await archiveIfExists(CMS_TABLES.AboutPage, existing)
  const result = await prisma.aboutPage.upsert({
    where: { id: existing?.id ?? 1 },
    create: { id: 1, ...parsed },
    update: parsed,
  })
  await auditLog("about_page_update", "Updated about page", ip)
  revalidatePublicSite()
  return result
}
