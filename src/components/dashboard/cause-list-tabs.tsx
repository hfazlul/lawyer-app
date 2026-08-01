"use client"

import { useMemo, useState } from "react"
import { addDays, format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CaseTable } from "./case-table"
import type { Case } from "@prisma/client"
import { CalendarDays, ChevronDown, Printer } from "lucide-react"
import {
  appDateKeyToDate,
  formatAppDate,
  isSameAppDay,
  startOfAppToday,
  toAppDateKey,
} from "@/lib/date-format"
import { cn } from "@/lib/utils"

type QuickFilter = "today" | "next" | "custom"

function filterByHearingDate(cases: Case[], date: Date) {
  return cases.filter((c) => c.nextDate && isSameAppDay(c.nextDate, date))
}

function getListTitle(date: Date, quickFilter: QuickFilter) {
  const today = startOfAppToday()
  const tomorrow = addDays(today, 1)

  if (quickFilter === "today" || isSameAppDay(date, today)) {
    return "Today's Cause List"
  }
  if (quickFilter === "next" || isSameAppDay(date, tomorrow)) {
    return "Next Day Cause List"
  }
  if (date < today) {
    return `Past Hearing — ${formatAppDate(date)}`
  }
  return `Hearing on ${formatAppDate(date)}`
}

export function CauseListTabs({ cases }: { cases: Case[] }) {
  const today = startOfAppToday()
  const tomorrow = addDays(today, 1)
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("today")
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [calendarOpen, setCalendarOpen] = useState(true)

  const todayCases = useMemo(() => filterByHearingDate(cases, today), [cases, today])
  const nextDayCases = useMemo(() => filterByHearingDate(cases, tomorrow), [cases, tomorrow])

  const filteredCases = useMemo(
    () => filterByHearingDate(cases, selectedDate),
    [cases, selectedDate]
  )

  const hearingCountByKey = useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of cases) {
      if (!c.nextDate) continue
      const key = toAppDateKey(c.nextDate)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }, [cases])

  const handlePrint = () => window.print()

  const selectToday = () => {
    setQuickFilter("today")
    setSelectedDate(today)
  }

  const selectNextDay = () => {
    setQuickFilter("next")
    setSelectedDate(tomorrow)
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return
    setSelectedDate(date)
    if (isSameAppDay(date, today)) {
      setQuickFilter("today")
    } else if (isSameAppDay(date, tomorrow)) {
      setQuickFilter("next")
    } else {
      setQuickFilter("custom")
    }
  }

  const isPastDate = selectedDate < today && !isSameAppDay(selectedDate, today)

  return (
    <div className="cause-list-print space-y-4">
      <div className="no-print flex justify-end">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Cause List
        </Button>
      </div>

      <div className="no-print flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={quickFilter === "today" ? "default" : "outline"}
            onClick={selectToday}
          >
            Today ({todayCases.length})
          </Button>
          <Button
            type="button"
            size="sm"
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
                  {format(selectedDate, "EEE, d MMM yyyy")} ·{" "}
                  <span className="font-medium text-emerald-700">{filteredCases.length}</span> case
                  {filteredCases.length === 1 ? "" : "s"}
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
              <CauseListCalendar
                selectedDate={selectedDate}
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
                <span className="font-semibold text-foreground">{format(selectedDate, "EEEE, d MMMM yyyy")}</span>
                {" · "}
                <span className="font-medium text-emerald-700">{filteredCases.length}</span> case
                {filteredCases.length === 1 ? "" : "s"}
                {isPastDate ? " · past hearing" : null}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <CaseTable
        key={toAppDateKey(selectedDate)}
        cases={filteredCases}
        title={getListTitle(selectedDate, quickFilter)}
        allowCreate={false}
        allowEdit={false}
        allowDelete={false}
        searchable
        compact
      />
    </div>
  )
}

function CauseListCalendar({
  selectedDate,
  onSelect,
  hearingCountByKey,
  today,
}: {
  selectedDate: Date
  onSelect: (date: Date | undefined) => void
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
      mode="single"
      selected={selectedDate}
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
