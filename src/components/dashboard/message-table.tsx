"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Copy, Download, FileSpreadsheet, MessageSquare, Phone } from "lucide-react"
import { toast } from "sonner"
import {
  exportMessagesCSV,
  exportMessagesExcel,
  markMessageAsRead,
} from "@/actions/admin/message-actions"
import { useCsrf } from "@/components/admin/csrf-provider"
import { formatAppDate } from "@/lib/date-format"

interface Message {
  id: number
  type: "appointment" | "contact"
  name: string
  phone: string
  message: string | null
  date: string | null
  status: string
  createdAt: string
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  if (normalized === "read") {
    return <Badge variant="success">Read</Badge>
  }
  if (normalized === "unread") {
    return <Badge variant="warning">Unread</Badge>
  }
  return <Badge variant="muted">{status}</Badge>
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function MessageTable({ messages }: { messages: Message[] }) {
  const router = useRouter()
  const csrf = useCsrf()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "appointment" | "contact">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return messages.filter((m) => {
      if (typeFilter !== "all" && m.type !== typeFilter) return false
      if (statusFilter !== "all" && m.status.toLowerCase() !== statusFilter) return false
      if (!q) return true
      return (
        m.name.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        (m.message?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [messages, search, typeFilter, statusFilter])

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone)
    toast.success("Phone number copied")
  }

  const copyAllPhones = () => {
    const unique = Array.from(new Set(filtered.map((m) => m.phone)))
    if (unique.length === 0) {
      toast.error("No phone numbers to copy")
      return
    }
    navigator.clipboard.writeText(unique.join(", "))
    toast.success(`Copied ${unique.length} phone number${unique.length === 1 ? "" : "s"}`)
  }

  const handleExportCsv = async () => {
    try {
      const csv = await exportMessagesCSV(csrf)
      downloadBlob(csv, `messages-${new Date().toISOString().split("T")[0]}.csv`, "text/csv;charset=utf-8")
      toast.success("CSV exported")
    } catch {
      toast.error("Export failed")
    }
  }

  const handleExportExcel = async () => {
    try {
      const xml = await exportMessagesExcel(csrf)
      downloadBlob(
        xml,
        `messages-${new Date().toISOString().split("T")[0]}.xls`,
        "application/vnd.ms-excel"
      )
      toast.success("Excel file exported")
    } catch {
      toast.error("Export failed")
    }
  }

  const handleMarkRead = (id: number, type: "appointment" | "contact") => {
    startTransition(async () => {
      try {
        await markMessageAsRead(csrf, id, type)
        toast.success("Marked as read")
        router.refresh()
      } catch {
        toast.error("Could not update message")
      }
    })
  }

  const unreadCount = messages.filter((m) => m.status.toLowerCase() === "unread").length

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageSquare className="h-5 w-5" />
                Client Messages
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {messages.length} total · {unreadCount} unread
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button variant="outline" size="sm" disabled>
                      Bulk SMS
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Bulk SMS requires a Bangladesh SMS gateway integration (e.g. SSL Wireless, Grameenphone).
                  This feature will be enabled once gateway credentials are configured.
                </TooltipContent>
              </Tooltip>
              <Button variant="outline" size="sm" onClick={copyAllPhones}>
                <Phone className="mr-2 h-4 w-4" />
                Copy Phones
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCsv}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Search name, phone, or message…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:max-w-xs"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All types</option>
              <option value="appointment">Appointment</option>
              <option value="contact">Contact</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      {messages.length === 0 ? "No messages yet" : "No messages match your filters"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((m) => (
                    <TableRow key={`${m.type}-${m.id}`}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {m.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-sm">{m.phone}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyPhone(m.phone)}
                            aria-label="Copy phone"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={m.message ?? undefined}>
                        {m.message ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {m.date ?? formatAppDate(m.createdAt)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={m.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {m.status.toLowerCase() === "unread" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleMarkRead(m.id, m.type)}
                          >
                            Mark read
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {filtered.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length} of {messages.length} messages
            </p>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
