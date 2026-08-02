import { jsPDF } from "jspdf"
import type { Case, CaseHistory } from "@prisma/client"
import { formatAppDate, formatAppDateTime } from "@/lib/date-format"
import {
  formatCourtName,
  formatOnBehalf,
  stripHtmlTags,
  STEPS_HISTORY_PREFIX,
} from "@/lib/case-helpers"
import { isDeactiveStatus } from "@/lib/cause-list-filters"

export type CaseWithHistory = Case & { history: CaseHistory[] }

export type CauseListReportGroup = {
  hearingDate: Date
  cases: CaseWithHistory[]
}

export type CauseListReportData = {
  generatedAt: Date
  groups: CauseListReportGroup[]
}

const MARGIN = 14
const PAGE_W = 210
const PAGE_H = 297
const CONTENT_W = PAGE_W - MARGIN * 2
const LINE = 4.8
const SECTION_GAP = 6

const NAVY = { r: 26, g: 39, b: 64 }
const GOLD = { r: 180, g: 145, b: 85 }
const MUTED = { r: 100, g: 108, b: 120 }
const BORDER = { r: 210, g: 214, b: 220 }
const PANEL = { r: 248, g: 249, b: 251 }

function formatStatusLabel(status: string) {
  if (isDeactiveStatus(status)) return "Deactive"
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function formatHistoryActionForPdf(action: string) {
  if (action === "steps_cleared") return "Steps cleared"
  if (action.startsWith(STEPS_HISTORY_PREFIX)) {
    return `Steps updated: ${stripHtmlTags(action.slice(STEPS_HISTORY_PREFIX.length))}`
  }
  const stepsMarker = "Steps: "
  const stepsIndex = action.indexOf(stepsMarker)
  if (stepsIndex >= 0) {
    const before = action.slice(0, stepsIndex).trim().replace(/\.\s*$/, "")
    const steps = stripHtmlTags(action.slice(stepsIndex + stepsMarker.length))
    return before ? `${before}. Steps: ${steps}` : `Steps: ${steps}`
  }
  return action
}

function asPdfBlob(blob: Blob) {
  if (blob.type === "application/pdf") return blob
  return new Blob([blob], { type: "application/pdf" })
}

class PdfWriter {
  private doc: jsPDF
  private y = MARGIN

  constructor() {
    this.doc = new jsPDF({ unit: "mm", format: "a4" })
  }

  private ensureSpace(needed: number) {
    if (this.y + needed > PAGE_H - MARGIN) {
      this.doc.addPage()
      this.y = MARGIN
    }
  }

  private wrappedText(
    text: string,
    x: number,
    maxWidth: number,
    fontSize = 10,
    style: "normal" | "bold" = "normal"
  ) {
    this.doc.setFont("helvetica", style)
    this.doc.setFontSize(fontSize)
    const lines = this.doc.splitTextToSize(text || "—", maxWidth)
    for (const line of lines) {
      this.ensureSpace(LINE)
      this.doc.text(line, x, this.y)
      this.y += LINE
    }
  }

  drawReportHeader(data: CauseListReportData) {
    const totalCases = data.groups.reduce((sum, g) => sum + g.cases.length, 0)
    const dateRange =
      data.groups.length === 1
        ? formatAppDate(data.groups[0].hearingDate)
        : data.groups.map((g) => formatAppDate(g.hearingDate)).join(" · ")

    this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b)
    this.doc.rect(0, 0, PAGE_W, 28, "F")
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(18)
    this.doc.text("Cause List Report", MARGIN, 12)
    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(`${totalCases} case${totalCases === 1 ? "" : "s"} · ${dateRange}`, MARGIN, 19)
    this.doc.text(`Generated ${formatAppDateTime(data.generatedAt)}`, MARGIN, 24)

    this.doc.setTextColor(30, 30, 30)
    this.y = 36
  }

  drawHearingSection(group: CauseListReportGroup) {
    this.ensureSpace(16)
    this.y += SECTION_GAP

    this.doc.setFillColor(GOLD.r, GOLD.g, GOLD.b)
    this.doc.rect(MARGIN, this.y - 4, CONTENT_W, 10, "F")
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b)
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(12)
    this.doc.text(`Hearing on ${formatAppDate(group.hearingDate)}`, MARGIN + 2, this.y + 2)
    this.doc.setFontSize(9)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(
      `${group.cases.length} case${group.cases.length === 1 ? "" : "s"}`,
      PAGE_W - MARGIN - 2,
      this.y + 2,
      { align: "right" }
    )
    this.doc.setTextColor(30, 30, 30)
    this.y += 12
  }

  private drawFieldRow(leftLabel: string, leftValue: string, rightLabel: string, rightValue: string) {
    const colW = CONTENT_W / 2 - 2
    const startY = this.y

    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(8)
    this.doc.setTextColor(MUTED.r, MUTED.g, MUTED.b)
    this.doc.text(leftLabel, MARGIN, startY)
    this.doc.text(rightLabel, MARGIN + CONTENT_W / 2, startY)

    this.doc.setTextColor(30, 30, 30)
    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(10)

    const leftLines = this.doc.splitTextToSize(leftValue || "—", colW)
    const rightLines = this.doc.splitTextToSize(rightValue || "—", colW)
    const rowLines = Math.max(leftLines.length, rightLines.length)

    this.ensureSpace(rowLines * LINE + 2)
    for (let i = 0; i < rowLines; i++) {
      const lineY = startY + 4 + i * LINE
      if (leftLines[i]) this.doc.text(leftLines[i], MARGIN, lineY)
      if (rightLines[i]) this.doc.text(rightLines[i], MARGIN + CONTENT_W / 2, lineY)
    }

    this.y = startY + 4 + rowLines * LINE + 2
  }

  drawCaseCard(caseRecord: CaseWithHistory, index: number) {
    this.ensureSpace(40)

    this.doc.setFillColor(PANEL.r, PANEL.g, PANEL.b)
    this.doc.rect(MARGIN, this.y - 2, CONTENT_W, 8, "F")
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(11)
    this.doc.setTextColor(NAVY.r, NAVY.g, NAVY.b)
    this.doc.text(
      `${index}. ${caseRecord.clientName} — ${caseRecord.caseNo}`,
      MARGIN + 2,
      this.y + 3
    )
    this.y += 11

    this.drawFieldRow("Serial", String(caseRecord.serial ?? "—"), "Status", formatStatusLabel(caseRecord.status))
    this.drawFieldRow("Court", formatCourtName(caseRecord.court), "Court Type", caseRecord.courtType || "—")
    this.drawFieldRow("Case Type", caseRecord.caseType, "On Behalf", formatOnBehalf(caseRecord.onBehalf))
    this.drawFieldRow("Contact", caseRecord.contactNo, "Email", caseRecord.email || "—")
    this.drawFieldRow(
      "Previous Date",
      formatAppDate(caseRecord.previousDate),
      "Next Date",
      formatAppDate(caseRecord.nextDate)
    )
    this.drawFieldRow(
      "Case File",
      caseRecord.caseFileLink || "—",
      "Last Updated",
      formatAppDateTime(caseRecord.updatedAt)
    )

    this.ensureSpace(8)
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(9)
    this.doc.setTextColor(MUTED.r, MUTED.g, MUTED.b)
    this.doc.text("Steps / Notes", MARGIN, this.y)
    this.y += 5
    this.doc.setTextColor(30, 30, 30)
    this.wrappedText(
      caseRecord.steps ? stripHtmlTags(caseRecord.steps) : "—",
      MARGIN,
      CONTENT_W,
      10
    )

    this.drawHistoryTable(caseRecord.history)

    this.ensureSpace(4)
    this.doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b)
    this.doc.setLineWidth(0.4)
    this.doc.line(MARGIN, this.y, MARGIN + CONTENT_W, this.y)
    this.y += SECTION_GAP
  }

  private drawHistoryTable(history: CaseHistory[]) {
    this.ensureSpace(14)
    this.y += 2
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(9)
    this.doc.setTextColor(MUTED.r, MUTED.g, MUTED.b)
    this.doc.text("Case History", MARGIN, this.y)
    this.y += 5

    if (history.length === 0) {
      this.doc.setFont("helvetica", "normal")
      this.doc.setFontSize(10)
      this.doc.setTextColor(30, 30, 30)
      this.doc.text("No history recorded.", MARGIN, this.y)
      this.y += LINE + 2
      return
    }

    const dateCol = 38
    const statusCol = 22
    const actionCol = CONTENT_W - dateCol - statusCol - 4
    const headerY = this.y

    this.doc.setFillColor(NAVY.r, NAVY.g, NAVY.b)
    this.doc.rect(MARGIN, headerY - 3.5, CONTENT_W, 7, "F")
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(8)
    this.doc.text("Date & Time", MARGIN + 2, headerY)
    this.doc.text("Action", MARGIN + dateCol + 2, headerY)
    this.doc.text("Status", MARGIN + dateCol + actionCol + 2, headerY)
    this.y = headerY + 6

    this.doc.setTextColor(30, 30, 30)
    this.doc.setFont("helvetica", "normal")

    for (const entry of history) {
      const dateText = formatAppDateTime(entry.date)
      const actionText = formatHistoryActionForPdf(entry.action)
      const statusText = formatStatusLabel(entry.status)

      const actionLines = this.doc.splitTextToSize(actionText, actionCol - 4)
      const rowHeight = Math.max(actionLines.length, 1) * LINE + 2
      this.ensureSpace(rowHeight + 2)

      const rowY = this.y
      this.doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b)
      this.doc.line(MARGIN, rowY + rowHeight - 1, MARGIN + CONTENT_W, rowY + rowHeight - 1)

      this.doc.setFontSize(8.5)
      this.doc.text(dateText, MARGIN + 2, rowY + 3)
      for (let i = 0; i < actionLines.length; i++) {
        this.doc.text(actionLines[i], MARGIN + dateCol + 2, rowY + 3 + i * LINE)
      }
      this.doc.text(statusText, MARGIN + dateCol + actionCol + 2, rowY + 3)

      this.y = rowY + rowHeight
    }

    this.y += 2
  }

  toBlob() {
    return asPdfBlob(this.doc.output("blob"))
  }
}

export function buildCauseListReportPdf(data: CauseListReportData): Blob {
  const writer = new PdfWriter()
  writer.drawReportHeader(data)

  for (const group of data.groups) {
    if (group.cases.length === 0) continue
    writer.drawHearingSection(group)
    group.cases.forEach((caseRecord, index) => writer.drawCaseCard(caseRecord, index + 1))
  }

  return writer.toBlob()
}

export function buildCauseListReportFilename(dates: Date[]) {
  const stamp = new Date().toISOString().slice(0, 10)
  if (dates.length === 1) {
    const safe = formatAppDate(dates[0]).replace(/\s+/g, "-").replace(/[/\\:*?"<>|]/g, "-")
    return `cause-list-${safe}.pdf`
  }
  return `cause-list-${dates.length}-dates-${stamp}.pdf`
}
