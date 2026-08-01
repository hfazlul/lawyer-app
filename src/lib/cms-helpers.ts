import { revalidatePath, revalidateTag } from "next/cache"
import { ZodError } from "zod"
import { archiveContent } from "@/actions/admin/archive"
import { PUBLIC_PATHS } from "@/lib/cms-tables"
import { ALL_PUBLIC_CACHE_TAGS } from "@/lib/cache-tags"

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

/** Ensures bilingual CMS fields exist; BN falls back to EN when left empty. */
export function normalizeBilingualCmsData(
  data: unknown,
  pairs: ReadonlyArray<readonly [string, string]>
): Record<string, unknown> {
  const result = {
    ...(data && typeof data === "object" ? (data as Record<string, unknown>) : {}),
  }

  for (const [enKey, bnKey] of pairs) {
    const en = asTrimmedString(result[enKey])
    const bn = asTrimmedString(result[bnKey])
    result[enKey] = en
    result[bnKey] = bn || en
  }

  return result
}

export function getCmsErrorMessage(error: unknown, fallback = "Save failed"): string {
  if (error instanceof ZodError) {
    const first = error.errors[0]
    if (first) {
      const field = first.path.length > 0 ? String(first.path[0]) : "field"
      if (field.endsWith("Bn")) {
        return "Fill the বাংলা tab or enter the English text first — Bengali will copy from English when empty."
      }
      if (field.endsWith("En")) {
        return "English field is required."
      }
      return `${field}: ${first.message}`
    }
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

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
