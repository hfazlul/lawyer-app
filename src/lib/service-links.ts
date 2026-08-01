import type { ServicePage } from "@prisma/client"
import type { ServiceGridItem } from "@/types/service-grid"
import { excerptText } from "@/lib/text-utils"

export function servicePageToGridItem(service: ServicePage): ServiceGridItem {
  const descriptionEn =
    excerptText(service.contentEn, 200) || service.titleEn
  const descriptionBn =
    excerptText(service.contentBn, 200) || service.titleBn

  return {
    id: service.id,
    titleEn: service.titleEn,
    titleBn: service.titleBn,
    descriptionEn,
    descriptionBn,
    icon: service.icon,
    href: `/services/${service.id}`,
  }
}
