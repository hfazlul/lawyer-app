import { prisma } from "@/lib/prisma"

/** Ensures every active Featured Service has a matching ServicePage for detail views. */
export async function syncFeaturedServicesToServicePages() {
  const featured = await prisma.featuredService.findMany({
    where: { status: "active" },
    orderBy: { sortOrder: "asc" },
  })

  for (const [index, item] of featured.entries()) {
    const existing = await prisma.servicePage.findFirst({
      where: { titleEn: item.titleEn },
    })

    if (!existing) {
      await prisma.servicePage.create({
        data: {
          titleEn: item.titleEn,
          titleBn: item.titleBn,
          contentEn: item.descriptionEn,
          contentBn: item.descriptionBn,
          icon: item.icon,
          sortOrder: item.sortOrder || index + 1,
          status: "active",
        },
      })
      continue
    }

    await prisma.servicePage.update({
      where: { id: existing.id },
      data: {
        titleBn: item.titleBn,
        sortOrder: item.sortOrder || index + 1,
        status: "active",
        icon: item.icon || existing.icon,
        contentEn:
          existing.contentEn.trim().length > item.descriptionEn.trim().length
            ? existing.contentEn
            : item.descriptionEn,
        contentBn:
          existing.contentBn.trim().length > item.descriptionBn.trim().length
            ? existing.contentBn
            : item.descriptionBn,
      },
    })
  }
}
