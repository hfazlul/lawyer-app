import { listLawyerArchives } from "@/lib/archive-queries"
import { ArchiveList } from "@/components/dashboard/archive-list"
import { ARCHIVE_RETENTION_DAYS } from "@/lib/constants"

export const dynamic = "force-dynamic"

export default async function LawyerArchivePage() {
  const archives = await listLawyerArchives()

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Case Archive</h1>
      <p className="mb-6 text-muted-foreground">
        Deleted cases from Overview, Judge Court, High Court, Supreme Court, and Cause List are
        kept for {ARCHIVE_RETENTION_DAYS} days. Restore or permanently delete entries below.
        Expired archives are purged automatically.
      </p>
      <ArchiveList
        archives={archives}
        emptyTitle="No archived cases."
        emptyDescription={`Deleted cases appear here for ${ARCHIVE_RETENTION_DAYS} days before automatic removal.`}
      />
    </div>
  )
}
