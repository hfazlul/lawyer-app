"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/session"
import { requireAdminMutation } from "@/lib/admin-mutation"

type MessageRow = {
  type: string
  name: string
  phone: string
  email: string
  service: string
  date: string
  message: string
  status: string
  createdAt: string
}

async function fetchAllMessages(): Promise<MessageRow[]> {
  const [apps, cons] = await Promise.all([
    prisma.appointmentMessage.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
  ])

  return [
    ...apps.map((m) => ({
      type: "Appointment",
      name: m.name,
      phone: m.phone,
      email: m.email ?? "",
      service: m.serviceType ?? "",
      date: m.preferredDate?.toISOString().split("T")[0] ?? "",
      message: m.message ?? "",
      status: m.status,
      createdAt: m.createdAt.toISOString(),
    })),
    ...cons.map((m) => ({
      type: "Contact",
      name: m.name,
      phone: m.phone,
      email: m.email ?? "",
      service: "",
      date: "",
      message: m.message ?? "",
      status: m.status,
      createdAt: m.createdAt.toISOString(),
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function escapeCsvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function buildCsv(rows: MessageRow[]): string {
  const headers = "Type,Name,Phone,Email,Service,Date,Message,Status,Received"
  const body = rows
    .map((r) =>
      [
        r.type,
        r.name,
        r.phone,
        r.email,
        r.service,
        r.date,
        r.message,
        r.status,
        r.createdAt,
      ]
        .map(escapeCsvField)
        .join(",")
    )
    .join("\n")
  return `\uFEFF${headers}\n${body}`
}

function buildExcelXml(rows: MessageRow[]): string {
  const headerCells = ["Type", "Name", "Phone", "Email", "Service", "Date", "Message", "Status", "Received"]
    .map((h) => `<Cell><Data ss:Type="String">${h}</Data></Cell>`)
    .join("")

  const dataRows = rows
    .map((r) => {
      const cells = [r.type, r.name, r.phone, r.email, r.service, r.date, r.message, r.status, r.createdAt]
        .map((v) => `<Cell><Data ss:Type="String">${v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</Data></Cell>`)
        .join("")
      return `<Row>${cells}</Row>`
    })
    .join("")

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Messages">
    <Table>
      <Row>${headerCells}</Row>
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`
}

export async function markMessageAsRead(csrfToken: string, id: number, type: "appointment" | "contact") {
  await requireAdminMutation(csrfToken)
  if (type === "appointment") {
    await prisma.appointmentMessage.update({ where: { id }, data: { status: "read" } })
  } else {
    await prisma.contactMessage.update({ where: { id }, data: { status: "read" } })
  }
  revalidatePath("/musaAdv/dashboard")
}

export async function exportMessagesCSV(csrfToken: string): Promise<string> {
  await requireAdminMutation(csrfToken)
  const rows = await fetchAllMessages()
  return buildCsv(rows)
}

export async function exportMessagesExcel(csrfToken: string): Promise<string> {
  await requireAdminMutation(csrfToken)
  const rows = await fetchAllMessages()
  return buildExcelXml(rows)
}
