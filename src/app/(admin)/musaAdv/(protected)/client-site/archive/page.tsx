import { listArchives } from "@/lib/archive-queries"
import { ArchiveList } from "@/components/dashboard/archive-list"
import { ARCHIVE_RETENTION_DAYS } from "@/lib/constants"

export default async function ArchivePage() {
  const archives = await listArchives()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Content Archive</h1>
      <p className="text-muted-foreground mb-6">
        Deleted CMS content and client messages are kept for {ARCHIVE_RETENTION_DAYS} days. Restore or permanently delete entries below.
        Expired archives are purged via <code className="text-xs bg-muted px-1 rounded">POST /api/archives/purge</code>.
      </p>
      <ArchiveList archives={archives} />
    </div>
  )
}
