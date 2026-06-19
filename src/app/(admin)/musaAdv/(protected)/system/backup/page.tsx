import { Database, HardDriveDownload } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { listBackups } from "@/actions/admin/backup-actions"
import { BackupList } from "./backup-list"
import { CreateBackupButton } from "./create-backup-button"

export default async function BackupPage() {
  const backups = await listBackups()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Backup & Restore</h1>
        <p className="mt-1 text-muted-foreground">
          Create, download, and restore database and upload backups
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDriveDownload className="h-5 w-5" />
              Create Manual Backup
            </CardTitle>
            <CardDescription>
              Exports the PostgreSQL database and uploads folder into a ZIP archive. Requires{" "}
              <code className="rounded bg-muted px-1 text-xs">pg_dump</code> (auto-detected on Windows, or set{" "}
              <code className="rounded bg-muted px-1 text-xs">PG_BIN_DIR</code>).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateBackupButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup Info
            </CardTitle>
            <CardDescription>Stored in the <code className="rounded bg-muted px-1 text-xs">backups/</code> directory on the server.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>{backups.length} backup{backups.length === 1 ? "" : "s"} available</p>
            <p>Restore overwrites current data — always confirm before restoring.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Backups</CardTitle>
          <CardDescription>Download, restore, or delete existing backup archives.</CardDescription>
        </CardHeader>
        <CardContent>
          <BackupList backups={backups} />
        </CardContent>
      </Card>
    </div>
  )
}
