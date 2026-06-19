import { prisma } from "@/lib/prisma"
import { MessageTable } from "@/components/dashboard/message-table"

export const dynamic = "force-dynamic"

export async function DashboardMessages() {
  const [apps, cons] = await Promise.all([
    prisma.appointmentMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ])

  const allMessages = [
    ...apps.map((m) => ({
      id: m.id,
      type: "appointment" as const,
      name: m.name,
      phone: m.phone,
      message: m.message,
      date: m.preferredDate?.toISOString().split("T")[0] ?? null,
      status: m.status,
      createdAt: m.createdAt.toISOString(),
    })),
    ...cons.map((m) => ({
      id: m.id,
      type: "contact" as const,
      name: m.name,
      phone: m.phone,
      message: m.message,
      date: null,
      status: m.status,
      createdAt: m.createdAt.toISOString(),
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return <MessageTable messages={allMessages} />
}
