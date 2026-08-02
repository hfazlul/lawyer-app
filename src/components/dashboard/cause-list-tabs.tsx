"use client"

import { useMemo, useState } from "react"
import { addDays, format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CaseTable } from "./case-table"
import type { Case } from "@prisma/client"
import { CalendarDays, ChevronDown, Loader2, Printer } from "lucide-react"
import {
  appDateKeyToDate,
  formatAppDate,
  isSameAppDay,
  startOfAppToday,
  toAppDateKey,
} from "@/lib/date-format"
import { getCauseListReportData } from "@/actions/admin/cause-list-actions"
import {
  buildCauseListReportFilename,
  buildCauseListReportPdf,
  type CaseWithHistory,
} from "@/lib/cause-list-report-pdf"
import {
  isCauseListMobileDevice,
  openCauseListPdf,
  shareCauseListPdf,
} from "@/lib/cause-list-pdf"
import { cn } from "@/lib/utils"

import {
  caseMatchesCauseListDate,
  getCauseListHearingDateKey,
} from "@/lib/cause-list-filters"

type QuickFilter = "today" | "next" | "custom"

function filterByHearingDate(cases: Case[], date: Date) {
  return cases.filter((c) => caseMatchesCauseListDate(c, date))
}

function filterByHearingDates(cases: Case[], dates: Date[]) {
  return cases.filter((c) => dates.some((date) => caseMatchesCauseListDate(c, date)))
}

function sortDates(dates: Date[]) {
  return dates.slice().sort((a, b) => a.getTime() - b.getTime())
}

function getListTitle(date: Date, quickFilter: QuickFilter) {
  const today = startOfAppToday()
  const tomorrow = addDays(today, 1)

  if (quickFilter === "today" && isSameAppDay(date, today)) {
    return "Today's Cause List"
  }
  if (quickFilter === "next" && isSameAppDay(date, tomorrow)) {
    return "Next Day Cause List"
  }
  if (date < today && !isSameAppDay(date, today)) {
    return `Past Hearing — ${formatAppDate(date)}`
  }
  return `Hearing on ${formatAppDate(date)}`
}

export function CauseListTabs({
  cases,
  readOnlyCases = false,
}: {
  cases: Case[]
  readOnlyCases?: boolean
}) {
  const today = startOfAppToday()
  const tomorrow = addDays(today, 1)
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("today")
  const [selectedDates, setSelectedDates] = useState<Date[]>([today])
  const [calendarOpen, setCalendarOpen] = useState(true)
  const [exportBusy, setExportBusy] = useState<"print" | "whatsapp" | null>(null)

  const todayCases = useMemo(() => filterByHearingDate(cases, today), [cases, today])
  const nextDayCases = useMemo(() => filterByHearingDate(cases, tomorrow), [cases, tomorrow])

  const sortedSelectedDates = useMemo(() => sortDates(selectedDates), [selectedDates])

  const dateGroups = useMemo(
    () =>
      sortedSelectedDates.map((date) => ({
        date,
        cases: filterByHearingDate(cases, date),
      })),
    [cases, sortedSelectedDates]
  )

  const totalSelectedCases = useMemo(
    () => filterByHearingDates(cases, selectedDates).length,
    [cases, selectedDates]
  )

  const hearingCountByKey = useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of cases) {
      const key = getCauseListHearingDateKey(c)
      if (!key) continue
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }, [cases])

  const buildExportFilename = () => buildCauseListReportFilename(sortedSelectedDates)

  const buildReportBlob = async () => {
    const selectedCaseIds = filterByHearingDates(cases, selectedDates).map((c) => c.id)
    if (selectedCaseIds.length === 0) throw new Error("no_cases")

    const reportCases = await getCauseListReportData(selectedCaseIds)
    const caseById = new Map(reportCases.map((c) => [c.id, c]))

    const groups = sortedSelectedDates.map((hearingDate) => ({
      hearingDate,
      cases: filterByHearingDate(cases, hearingDate)
        .map((c) => caseById.get(c.id))
        .filter((c): c is CaseWithHistory => !!c),
    }))

    return buildCauseListReportPdf({
      generatedAt: new Date(),
      groups,
    })
  }

  const handleExportError = (error: unknown) => {
    if (error instanceof Error && error.message === "no_cases") {
      toast.error("No cases for the selected dates")
      return
    }
    console.error("Cause list export failed:", error)
    toast.error("Could not generate PDF. Try again.")
  }

  const handlePrint = async () => {
    setExportBusy("print")
    try {
      const blob = await buildReportBlob()
      await openCauseListPdf(blob)
      toast.success(
        isCauseListMobileDevice()
          ? "PDF opened — save or print from your device"
          : "PDF opened — use Print in the viewer"
      )
    } catch (error) {
      handleExportError(error)
    } finally {
      setExportBusy(null)
    }
  }

  const handleWhatsAppShare = async () => {
    setExportBusy("whatsapp")
    try {
      const blob = await buildReportBlob()
      const filename = buildExportFilename()
      const result = await shareCauseListPdf(blob, filename)
      if (result === "shared") {
        toast.success("Select WhatsApp from the share menu to send the PDF file")
      } else {
        toast.success(
          "PDF downloaded — open WhatsApp, tap attach (📎), and select the downloaded PDF",
          { duration: 6000 }
        )
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return
      handleExportError(error)
    } finally {
      setExportBusy(null)
    }
  }

  const selectToday = () => {
    setQuickFilter("today")
    setSelectedDates([today])
  }

  const selectNextDay = () => {
    setQuickFilter("next")
    setSelectedDates([tomorrow])
  }

  const handleCalendarSelect = (dates: Date[] | undefined) => {
    if (!dates || dates.length === 0) {
      setQuickFilter("today")
      setSelectedDates([today])
      return
    }

    setSelectedDates(dates)

    if (dates.length === 1) {
      const date = dates[0]
      if (isSameAppDay(date, today)) setQuickFilter("today")
      else if (isSameAppDay(date, tomorrow)) setQuickFilter("next")
      else setQuickFilter("custom")
    } else {
      setQuickFilter("custom")
    }
  }

  const primaryDate = sortedSelectedDates[0] ?? today
  const isPastDate = primaryDate < today && !isSameAppDay(primaryDate, today)
  const isMultiDate = selectedDates.length > 1

  return (
    <div className="cause-list-print space-y-4">
      <div className="no-print flex flex-wrap justify-start gap-1.5 sm:justify-end sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 shrink-0 px-2.5 text-xs sm:h-9 sm:px-3 sm:text-sm"
          onClick={handlePrint}
          disabled={exportBusy !== null}
        >
          {exportBusy === "print" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin sm:mr-2 sm:h-4 sm:w-4" />
          ) : (
            <Printer className="h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
          )}
          <span className="sm:hidden">PDF</span>
          <span className="hidden sm:inline">
            {isCauseListMobileDevice() ? "Save / Print PDF" : "Open PDF"}
            {isMultiDate ? ` (${selectedDates.length} dates)` : ""}
          </span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 shrink-0 border-emerald-600 px-2.5 text-xs text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 sm:h-9 sm:px-3 sm:text-sm"
          onClick={handleWhatsAppShare}
          disabled={exportBusy !== null}
        >
          {exportBusy === "whatsapp" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin sm:mr-2 sm:h-4 sm:w-4" />
          ) : (
            <WhatsAppIcon className="h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
          )}
          <span className="sm:hidden">WhatsApp</span>
          <span className="hidden sm:inline">WhatsApp Share</span>
        </Button>
      </div>

      {isMultiDate ? (
        <div className="hidden rounded-md border bg-muted/40 p-3 text-sm print:block">
          <p className="font-semibold">Selected hearing dates</p>
          <p className="mt-1 text-muted-foreground">
            {sortedSelectedDates.map((date) => formatAppDate(date)).join(" · ")}
          </p>
          <p className="mt-1 text-muted-foreground">
            {totalSelectedCases} case{totalSelectedCases === 1 ? "" : "s"} across {selectedDates.length}{" "}
            date{selectedDates.length === 1 ? "" : "s"}
          </p>
        </div>
      ) : null}

      <div className="no-print flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <Button
            type="button"
            size="sm"
            className="h-8 px-3 text-xs sm:text-sm"
            variant={quickFilter === "today" ? "default" : "outline"}
            onClick={selectToday}
          >
            Today ({todayCases.length})
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 px-3 text-xs sm:text-sm"
            variant={quickFilter === "next" ? "default" : "outline"}
            onClick={selectNextDay}
          >
            Next Day ({nextDayCases.length})
          </Button>
        </div>

        <div className="w-full rounded-xl border border-emerald-200/60 bg-gradient-to-br from-white via-emerald-50/30 to-white shadow-sm xl:max-w-[360px]">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-emerald-50/40"
            onClick={() => setCalendarOpen((open) => !open)}
            aria-expanded={calendarOpen}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-navy">
                <CalendarDays className="h-4 w-4 shrink-0 text-emerald-700" />
                Hearing date filter
              </div>
              {!calendarOpen ? (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {isMultiDate
                    ? `${selectedDates.length} dates selected · ${totalSelectedCases} cases`
                    : `${format(primaryDate, "EEE, d MMM yyyy")} · ${totalSelectedCases} case${
                        totalSelectedCases === 1 ? "" : "s"
                      }`}
                </p>
              ) : null}
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
                calendarOpen && "rotate-180"
              )}
            />
          </button>

          {calendarOpen ? (
            <div className="border-t border-emerald-100/80 px-4 pb-4 pt-2">
              <p className="mb-2 text-center text-xs text-muted-foreground">
                Click one or more dates to view and print cause lists together.
              </p>
              <CauseListCalendar
                selectedDates={selectedDates}
                onSelect={handleCalendarSelect}
                hearingCountByKey={hearingCountByKey}
                today={today}
              />
              <div className="mt-3 flex flex-wrap justify-center gap-3 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded border-2 border-emerald-600 bg-emerald-100" />
                  Upcoming
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded border-2 border-orange-500 bg-orange-100" />
                  Past
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-navy" />
                  Selected
                </span>
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {isMultiDate ? (
                  <>
                    <span className="font-semibold text-foreground">
                      {selectedDates.length} date{selectedDates.length === 1 ? "" : "s"} selected
                    </span>
                    {" · "}
                    <span className="font-medium text-emerald-700">{totalSelectedCases}</span> case
                    {totalSelectedCases === 1 ? "" : "s"} total
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-foreground">
                      {format(primaryDate, "EEEE, d MMMM yyyy")}
                    </span>
                    {" · "}
                    <span className="font-medium text-emerald-700">{totalSelectedCases}</span> case
                    {totalSelectedCases === 1 ? "" : "s"}
                    {isPastDate ? " · past hearing" : null}
                  </>
                )}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-6">
        {dateGroups.map(({ date, cases: groupCases }) => (
          <CaseTable
            key={toAppDateKey(date)}
            cases={groupCases}
            title={getListTitle(date, quickFilter)}
            showCourtColumn
            mobileFullColumns
            allowCreate={false}
            allowEdit={!readOnlyCases}
            allowDelete={!readOnlyCases}
            searchable={!isMultiDate}
          />
        ))}
      </div>
    </div>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.004 2C6.477 2 2 6.477 2 12.004c0 1.99.516 3.86 1.42 5.52L2 22l4.65-1.37A9.94 9.94 0 0 0 12.004 22C17.531 22 22 17.531 22 12.004S17.531 2 12.004 2z" />
    </svg>
  )
}

function CauseListCalendar({
  selectedDates,
  onSelect,
  hearingCountByKey,
  today,
}: {
  selectedDates: Date[]
  onSelect: (dates: Date[] | undefined) => void
  hearingCountByKey: Map<string, number>
  today: Date
}) {
  const todayKey = toAppDateKey(today)

  const { pastHearingDates, upcomingHearingDates } = useMemo(() => {
    const past: Date[] = []
    const upcoming: Date[] = []
    for (const key of hearingCountByKey.keys()) {
      const date = appDateKeyToDate(key)
      if (key < todayKey) past.push(date)
      else upcoming.push(date)
    }
    return { pastHearingDates: past, upcomingHearingDates: upcoming }
  }, [hearingCountByKey, todayKey])

  return (
    <Calendar
      mode="multiple"
      selected={selectedDates}
      onSelect={onSelect}
      modifiers={{
        hearingPast: pastHearingDates,
        hearingUpcoming: upcomingHearingDates,
      }}
      modifiersClassNames={{
        hearingPast: "hearing-past-day",
        hearingUpcoming: "hearing-upcoming-day",
      }}
      classNames={{
        cell: "h-11 w-11 p-0.5 text-center text-sm relative",
        day: "h-10 w-10 p-0 font-medium",
        day_today: "ring-2 ring-gold/80 ring-offset-1",
      }}
      components={{
        DayContent: ({ date }) => {
          const count = hearingCountByKey.get(toAppDateKey(date))
          const isPast = toAppDateKey(date) < todayKey
          return (
            <div className="flex flex-col items-center justify-center gap-0.5 leading-none">
              <span className="text-sm">{date.getDate()}</span>
              {count ? (
                <span
                  className={
                    isPast
                      ? "flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-orange-600 px-1 text-[9px] font-bold text-white shadow-sm"
                      : "flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold text-white shadow-sm"
                  }
                >
                  {count}
                </span>
              ) : null}
            </div>
          )
        },
      }}
      className="cause-list-calendar mx-auto w-full"
    />
  )
}
