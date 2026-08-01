import { Database, HardDriveDownload, Upload } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { listBackups } from "@/actions/admin/backup-actions"
import { BACKUP_TABLE_ORDER } from "@/lib/database-backup"
import { BackupList } from "./backup-list"
import { CreateBackupButton } from "./create-backup-button"
import { ImportBackupButton } from "./import-backup-button"

export default async function BackupPage() {
  const backups = await listBackups()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Backup & Restore</h1>
        <p className="mt-1 text-muted-foreground">
          Export all database tables and uploaded files, then restore them exactly as before
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDriveDownload className="h-5 w-5" />
              Export Backup
            </CardTitle>
            <CardDescription>
              Creates a ZIP file with <code className="rounded bg-muted px-1 text-xs">data.json</code>{" "}
              (all {BACKUP_TABLE_ORDER.length} database tables) plus the{" "}
              <code className="rounded bg-muted px-1 text-xs">uploads/</code> folder. No PostgreSQL
              tools required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateBackupButton />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Backup
            </CardTitle>
            <CardDescription>
              Upload a previously exported ZIP file to restore all data and uploads. Current data
              will be replaced.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImportBackupButton />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup Info
          </CardTitle>
          <CardDescription>
            Stored in the <code className="rounded bg-muted px-1 text-xs">backups/</code> directory on
            the server.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            {backups.length} backup{backups.length === 1 ? "" : "s"} available
          </p>
          <p>
            Included tables: {BACKUP_TABLE_ORDER.join(", ")}
          </p>
          <p>Restore overwrites current data — always confirm before restoring.</p>
        </CardContent>
      </Card>

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
