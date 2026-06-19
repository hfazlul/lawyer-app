import { revalidatePath, revalidateTag } from "next/cache"
import { archiveContent } from "@/actions/admin/archive"
import { PUBLIC_PATHS } from "@/lib/cms-tables"
import { ALL_PUBLIC_CACHE_TAGS } from "@/lib/cache-tags"

export async function archiveIfExists(tableName: string, record: { id: number } | null | undefined) {
  if (record) {
    await archiveContent(tableName, record.id, record)
  }
}

export function revalidatePublicSite() {
  for (const path of PUBLIC_PATHS) {
    revalidatePath(path)
  }
  for (const tag of ALL_PUBLIC_CACHE_TAGS) {
    revalidateTag(tag)
  }
}

export async function getNextSortOrder(
  findMany: () => Promise<{ sortOrder: number }[]>
): Promise<number> {
  const items = await findMany()
  if (items.length === 0) return 1
  return Math.max(...items.map((i) => i.sortOrder)) + 1
}
