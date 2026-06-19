import { cache } from "react"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { PUBLIC_CACHE_TAGS } from "@/lib/cache-tags"

const getAdminCountCached = unstable_cache(
  async () => prisma.admin.count(),
  ["admin-count"],
  { tags: [PUBLIC_CACHE_TAGS.adminExists], revalidate: 3600 }
)

export const getAdminCount = cache(getAdminCountCached)
