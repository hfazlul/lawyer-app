import { purgeExpiredArchives } from "@/actions/admin/archive"

async function main() {
  const result = await purgeExpiredArchives()
  console.log(`Purged ${result.deleted} expired archive(s)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
