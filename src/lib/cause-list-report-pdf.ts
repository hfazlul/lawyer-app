import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
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

const PAGE_W_MM = 210
const PAGE_H_MM = 297
const RENDER_WIDTH_PX = 794

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

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

function field(label: string, value: string) {
  return `
    <div class="field">
      <div class="field-label">${escapeHtml(label)}</div>
      <div class="field-value">${escapeHtml(value || "—")}</div>
    </div>
  `
}

function renderHistoryRows(history: CaseHistory[]) {
  if (history.length === 0) {
    return `<p class="empty">No history recorded.</p>`
  }

  const rows = history
    .map(
      (entry) => `
      <tr>
        <td class="col-date">${escapeHtml(formatAppDateTime(entry.date))}</td>
        <td class="col-action">${escapeHtml(formatHistoryActionForPdf(entry.action))}</td>
        <td class="col-status">${escapeHtml(formatStatusLabel(entry.status))}</td>
      </tr>
    `
    )
    .join("")

  return `
    <table class="history-table">
      <thead>
        <tr>
          <th class="col-date">Date &amp; Time</th>
          <th class="col-action">Action</th>
          <th class="col-status">Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `
}

function renderCaseCard(caseRecord: CaseWithHistory, index: number) {
  const steps = caseRecord.steps ? stripHtmlTags(caseRecord.steps) : "—"
  return `
    <section class="case-card">
      <div class="case-title">${escapeHtml(`${index}. ${caseRecord.clientName} — ${caseRecord.caseNo}`)}</div>
      <div class="fields">
        ${field("Serial", String(caseRecord.serial ?? "—"))}
        ${field("Status", formatStatusLabel(caseRecord.status))}
        ${field("Court", formatCourtName(caseRecord.court))}
        ${field("Court Type", caseRecord.courtType || "—")}
        ${field("Case Type", caseRecord.caseType)}
        ${field("On Behalf", formatOnBehalf(caseRecord.onBehalf))}
        ${field("Contact", caseRecord.contactNo)}
        ${field("Email", caseRecord.email || "—")}
        ${field("Previous Date", formatAppDate(caseRecord.previousDate))}
        ${field("Next Date", formatAppDate(caseRecord.nextDate))}
        ${field("Case File", caseRecord.caseFileLink || "—")}
        ${field("Last Updated", formatAppDateTime(caseRecord.updatedAt))}
      </div>
      <div class="section-label">Steps / Notes</div>
      <p class="steps">${escapeHtml(steps)}</p>
      <div class="section-label">Case History</div>
      ${renderHistoryRows(caseRecord.history)}
    </section>
  `
}

function buildReportHtml(data: CauseListReportData) {
  const totalCases = data.groups.reduce((sum, g) => sum + g.cases.length, 0)
  const dateRange =
    data.groups.length === 1
      ? formatAppDate(data.groups[0].hearingDate)
      : data.groups.map((g) => formatAppDate(g.hearingDate)).join(" · ")

  const groupsHtml = data.groups
    .filter((group) => group.cases.length > 0)
    .map((group) => {
      const cards = group.cases.map((c, i) => renderCaseCard(c, i + 1)).join("")
      return `
        <section class="hearing">
          <div class="hearing-bar">
            <span>Hearing on ${escapeHtml(formatAppDate(group.hearingDate))}</span>
            <span>${group.cases.length} case${group.cases.length === 1 ? "" : "s"}</span>
          </div>
          ${cards}
        </section>
      `
    })
    .join("")

  return `
    <div class="report-root">
      <header class="report-header">
        <h1>Cause List Report</h1>
        <p>${escapeHtml(`${totalCases} case${totalCases === 1 ? "" : "s"} · ${dateRange}`)}</p>
        <p>Generated ${escapeHtml(formatAppDateTime(data.generatedAt))}</p>
      </header>
      ${groupsHtml}
    </div>
  `
}

const REPORT_STYLES = `
  @font-face {
    font-family: "NotoSansBengali";
    src: url("/fonts/NotoSansBengali-Regular.ttf") format("truetype");
    font-weight: 400;
    font-style: normal;
    font-display: block;
  }
  @font-face {
    font-family: "NotoSansBengali";
    src: url("/fonts/NotoSansBengali-Bold.ttf") format("truetype");
    font-weight: 700;
    font-style: normal;
    font-display: block;
  }
  .report-root {
    width: ${RENDER_WIDTH_PX}px;
    box-sizing: border-box;
    padding: 0 0 24px;
    background: #ffffff;
    color: #1e1e1e;
    font-family: "NotoSansBengali", "Noto Sans Bengali", Arial, sans-serif;
    font-size: 13px;
    line-height: 1.45;
    -webkit-font-smoothing: antialiased;
  }
  .report-header {
    background: #1a2740;
    color: #ffffff;
    padding: 18px 28px 16px;
  }
  .report-header h1 {
    margin: 0 0 6px;
    font-size: 24px;
    font-weight: 700;
  }
  .report-header p {
    margin: 0;
    font-size: 12px;
    opacity: 0.95;
  }
  .hearing {
    padding: 16px 28px 0;
  }
  .hearing-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #b49155;
    color: #1a2740;
    font-weight: 700;
    font-size: 14px;
    padding: 8px 12px;
    margin-bottom: 12px;
  }
  .case-card {
    border-bottom: 1px solid #d2d6dc;
    padding-bottom: 16px;
    margin-bottom: 16px;
  }
  .case-title {
    background: #f8f9fb;
    color: #1a2740;
    font-weight: 700;
    font-size: 15px;
    padding: 8px 10px;
    margin-bottom: 10px;
  }
  .fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 18px;
    margin-bottom: 10px;
  }
  .field-label {
    color: #646c78;
    font-size: 10px;
    font-weight: 700;
    text-transform: none;
    margin-bottom: 2px;
  }
  .field-value {
    font-size: 13px;
    word-break: break-word;
  }
  .section-label {
    color: #646c78;
    font-size: 11px;
    font-weight: 700;
    margin: 10px 0 4px;
  }
  .steps, .empty {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .history-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    margin-top: 4px;
  }
  .history-table th,
  .history-table td {
    border-bottom: 1px solid #d2d6dc;
    padding: 6px 8px;
    vertical-align: top;
    text-align: left;
    font-size: 11px;
  }
  .history-table thead th {
    background: #1a2740;
    color: #ffffff;
    font-weight: 700;
  }
  .col-date { width: 26%; }
  .col-action { width: 56%; word-break: break-word; }
  .col-status { width: 18%; }
`

async function waitForFonts(host: HTMLElement) {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }
  try {
    await Promise.all([
      document.fonts.load('400 13px "NotoSansBengali"'),
      document.fonts.load('700 13px "NotoSansBengali"'),
    ])
  } catch {
    // Font load APIs can fail in some browsers; continue with fallbacks.
  }
  // Give the browser a paint cycle to apply the loaded face.
  await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
  void host
}

function createOffscreenHost(html: string) {
  const host = document.createElement("div")
  host.setAttribute("aria-hidden", "true")
  host.style.cssText = [
    "position:fixed",
    "left:-10000px",
    "top:0",
    "width:" + RENDER_WIDTH_PX + "px",
    "background:#ffffff",
    "z-index:-1",
    "pointer-events:none",
  ].join(";")

  const style = document.createElement("style")
  style.textContent = REPORT_STYLES
  host.appendChild(style)

  const content = document.createElement("div")
  content.innerHTML = html
  host.appendChild(content)

  document.body.appendChild(host)
  return host
}

function canvasToPdf(canvas: HTMLCanvasElement): Blob {
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" })
  const pageWidthPx = canvas.width
  const pageHeightPx = Math.floor((PAGE_H_MM / PAGE_W_MM) * pageWidthPx)
  const totalPages = Math.max(1, Math.ceil(canvas.height / pageHeightPx))

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) pdf.addPage()

    const sourceY = page * pageHeightPx
    const sliceHeight = Math.min(pageHeightPx, canvas.height - sourceY)
    const pageCanvas = document.createElement("canvas")
    pageCanvas.width = pageWidthPx
    pageCanvas.height = sliceHeight
    const ctx = pageCanvas.getContext("2d")
    if (!ctx) throw new Error("Could not create PDF page canvas")

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, pageWidthPx, sliceHeight)
    ctx.drawImage(
      canvas,
      0,
      sourceY,
      pageWidthPx,
      sliceHeight,
      0,
      0,
      pageWidthPx,
      sliceHeight
    )

    const imgData = pageCanvas.toDataURL("image/jpeg", 0.95)
    const renderHeightMm = (sliceHeight / pageWidthPx) * PAGE_W_MM
    pdf.addImage(imgData, "JPEG", 0, 0, PAGE_W_MM, renderHeightMm)
  }

  return asPdfBlob(pdf.output("blob"))
}

export async function buildCauseListReportPdf(data: CauseListReportData): Promise<Blob> {
  if (typeof document === "undefined") {
    throw new Error("Cause list PDF can only be generated in the browser")
  }

  const host = createOffscreenHost(buildReportHtml(data))
  try {
    await waitForFonts(host)
    const canvas = await html2canvas(host, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
      width: RENDER_WIDTH_PX,
      windowWidth: RENDER_WIDTH_PX,
      onclone: (_doc, cloned) => {
        cloned.style.left = "0"
        cloned.style.top = "0"
        cloned.style.position = "static"
      },
    })
    return canvasToPdf(canvas)
  } finally {
    host.remove()
  }
}

export function buildCauseListReportFilename(dates: Date[]) {
  const stamp = new Date().toISOString().slice(0, 10)
  if (dates.length === 1) {
    const safe = formatAppDate(dates[0]).replace(/\s+/g, "-").replace(/[/\\:*?"<>|]/g, "-")
    return `cause-list-${safe}.pdf`
  }
  return `cause-list-${dates.length}-dates-${stamp}.pdf`
}
