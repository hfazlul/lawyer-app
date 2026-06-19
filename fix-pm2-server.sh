#!/bin/bash
set -e
cd /var/www/lawyer-app

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: "lawyer-app",
    script: "node_modules/next/dist/bin/next",
    args: "start -p 3000",
    cwd: "/var/www/lawyer-app",
    exec_mode: "fork",
    instances: 1,
    env: { NODE_ENV: "production", PORT: 3000 },
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
  }],
}
EOF

mkdir -p src/components/admin
cat > src/components/admin/csrf-shell.tsx << 'EOF'
import { CsrfProvider } from "@/components/admin/csrf-provider"
import { getOrSetCsrfToken } from "@/lib/csrf"

export async function CsrfShell({ children }: { children: React.ReactNode }) {
  const csrfToken = await getOrSetCsrfToken()
  return <CsrfProvider initialToken={csrfToken}>{children}</CsrfProvider>
}
EOF

cat > src/app/\(admin\)/musaAdv/\(protected\)/layout.tsx << 'EOLAYOUT'
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { CsrfShell } from "@/components/admin/csrf-shell"

export const dynamic = "force-dynamic"

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <CsrfShell>{children}</CsrfShell>
        </main>
      </div>
    </div>
  )
}
EOLAYOUT

cat > src/lib/public-data-cache.ts << 'EOCACHE'
import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { DEFAULT_NAV_ITEMS } from "@/lib/constants"

export const getSiteSettings = cache(async () => prisma.siteSetting.findFirst())

export const getNavItems = cache(async () => {
  const items = await prisma.navItem.findMany({
    where: { status: "active" },
    orderBy: { sortOrder: "asc" },
  })
  if (items.length === 0) {
    return DEFAULT_NAV_ITEMS.map((item, index) => ({
      id: index + 1,
      ...item,
      status: "active" as const,
    }))
  }
  return items
})

export const getHomeSections = cache(async () => {
  const [heroSlides, intro, featuredServices, successStats, activities, testimonials] =
    await Promise.all([
      prisma.heroSlide.findMany({ where: { status: "active" }, orderBy: { sortOrder: "asc" } }),
      prisma.homeIntro.findFirst(),
      prisma.featuredService.findMany({
        where: { status: "active" },
        orderBy: { sortOrder: "asc" },
        take: 6,
      }),
      prisma.successStat.findMany({ where: { status: "active" } }),
      prisma.activity.findMany({ where: { status: "active" }, orderBy: { id: "asc" } }),
      prisma.testimonial.findMany({ where: { status: "active" }, orderBy: { id: "asc" } }),
    ])
  return { heroSlides, intro, featuredServices, successStats, activities, testimonials }
})

export const getAboutPage = cache(async () => prisma.aboutPage.findFirst())
export const getServices = cache(async () =>
  prisma.servicePage.findMany({ where: { status: "active" }, orderBy: { sortOrder: "asc" } })
)
export const getAppointmentSetting = cache(async () => prisma.appointmentSetting.findFirst())
export const getContactSetting = cache(async () => prisma.contactSetting.findFirst())
export const getHomeIntro = cache(async () => prisma.homeIntro.findFirst())
EOCACHE

grep -q 'export const dynamic = "force-dynamic"' src/app/\(public\)/layout.tsx || \
  sed -i '/^import { PublicPageSkeleton }/a\
\
export const dynamic = "force-dynamic"' src/app/\(public\)/layout.tsx

for f in src/app/\(public\)/page.tsx src/app/\(public\)/about/page.tsx \
         src/app/\(public\)/contact/page.tsx src/app/\(public\)/appointment/page.tsx \
         src/app/\(public\)/services/page.tsx; do
  sed -i '/^export const revalidate = 300$/d' "$f" 2>/dev/null || true
done

grep AUTH_URL .env.local || true
rm -rf .next node_modules/.cache
npm run build
pm2 delete lawyer-app 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
echo ""
pm2 status
echo ""
sudo -u postgres psql -d lawyer_db -c 'SELECT COUNT(*) AS contacts FROM "ContactMessage";'
