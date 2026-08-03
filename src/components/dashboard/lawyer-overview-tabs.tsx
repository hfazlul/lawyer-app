"use client"

import { useMemo, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CaseTable } from "@/components/dashboard/case-table"
import type { Case, CourtType } from "@prisma/client"
import {
  isActiveStatus,
  isOverviewCompletedCase,
  isDeactiveStatus,
} from "@/lib/cause-list-filters"

const COURT_FILTERS = [
  { value: "all", label: "All Cases" },
  { value: "JUDGE_COURT", label: "Judge Court" },
  { value: "HIGH_COURT", label: "High Court" },
  { value: "SUPREME_COURT", label: "Supreme Court" },
] as const

const STATUS_TABS = [
  { value: "completed", label: "Completed" },
  { value: "deactive", label: "Deactivated" },
] as const

type CourtFilter = (typeof COURT_FILTERS)[number]["value"]
type StatusTab = (typeof STATUS_TABS)[number]["value"]
type OverviewTab = CourtFilter | StatusTab

export function LawyerOverviewTabs({ cases }: { cases: Case[] }) {
  const [activeTab, setActiveTab] = useState<OverviewTab>("all")

  const activeCases = useMemo(
    () => cases.filter((c) => isActiveStatus(c.status)),
    [cases]
  )
  const completedCases = useMemo(
    () => cases.filter((c) => isOverviewCompletedCase(c)),
    [cases]
  )
  const deactiveCases = useMemo(
    () => cases.filter((c) => isDeactiveStatus(c.status)),
    [cases]
  )

  const counts = useMemo(
    () => ({
      all: activeCases.length,
      JUDGE_COURT: activeCases.filter((c) => c.court === "JUDGE_COURT").length,
      HIGH_COURT: activeCases.filter((c) => c.court === "HIGH_COURT").length,
      SUPREME_COURT: activeCases.filter((c) => c.court === "SUPREME_COURT").length,
      completed: completedCases.length,
      deactive: deactiveCases.length,
    }),
    [activeCases, completedCases, deactiveCases]
  )

  const filteredCases = useMemo(() => {
    if (activeTab === "completed") return completedCases
    if (activeTab === "deactive") return deactiveCases
    if (activeTab === "all") return activeCases
    return activeCases.filter((c) => c.court === activeTab)
  }, [activeTab, activeCases, completedCases, deactiveCases])

  const listMode =
    activeTab === "completed"
      ? "completed"
      : activeTab === "deactive"
        ? "deactive"
        : "active"

  const isCourtTab = activeTab !== "completed" && activeTab !== "deactive"

  const defaultCourt: CourtType =
    isCourtTab && activeTab !== "all" ? (activeTab as CourtType) : "JUDGE_COURT"

  const title =
    activeTab === "completed"
      ? "Completed Cases"
      : activeTab === "deactive"
        ? "Deactivated Cases"
        : activeTab === "all"
          ? "All Clients / Cases"
          : `${COURT_FILTERS.find((f) => f.value === activeTab)?.label} Cases`

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OverviewTab)}>
        <TabsList className="lawyer-overview-tabs flex h-auto w-full flex-wrap justify-start gap-1.5 rounded-xl border border-emerald-900/10 bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 p-1.5 shadow-sm sm:gap-2 sm:p-2">
          {COURT_FILTERS.map((filter) => (
            <TabsTrigger
              key={filter.value}
              value={filter.value}
              className="rounded-lg border border-transparent px-2.5 py-2 text-xs font-semibold text-slate-500 transition-all duration-300 hover:border-emerald-200 hover:bg-white/80 hover:text-emerald-900 data-[state=active]:border-emerald-300/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0a1f14] data-[state=active]:via-[#134e2a] data-[state=active]:to-[#1a6b42] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-900/35 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              {filter.label}
              <span
                className={
                  activeTab === filter.value
                    ? "ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold tabular-nums text-white"
                    : "ml-1.5 tabular-nums opacity-70"
                }
              >
                {activeTab === filter.value ? counts[filter.value] : `(${counts[filter.value]})`}
              </span>
            </TabsTrigger>
          ))}
          {STATUS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={
                tab.value === "completed"
                  ? "rounded-lg border border-transparent px-2.5 py-2 text-xs font-semibold text-slate-500 transition-all duration-300 hover:border-emerald-200 hover:bg-white/80 hover:text-emerald-800 data-[state=active]:border-emerald-400/40 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md sm:px-4 sm:py-2.5 sm:text-sm"
                  : "rounded-lg border border-transparent px-2.5 py-2 text-xs font-semibold text-slate-500 transition-all duration-300 hover:border-red-200 hover:bg-white/80 hover:text-red-800 data-[state=active]:border-red-300/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-md sm:px-4 sm:py-2.5 sm:text-sm"
              }
            >
              {tab.label}
              <span
                className={
                  activeTab === tab.value
                    ? "ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold tabular-nums text-white"
                    : "ml-1.5 tabular-nums opacity-70"
                }
              >
                {activeTab === tab.value ? counts[tab.value] : `(${counts[tab.value]})`}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <CaseTable
        key={activeTab}
        cases={filteredCases}
        title={title}
        defaultCourt={defaultCourt}
        lockCourt={isCourtTab && activeTab !== "all"}
        showCourtColumn={activeTab === "all" || activeTab === "completed" || activeTab === "deactive"}
        mobileFullColumns
        historyPhoneFilter
        searchable
        listMode={listMode}
        allowCreate={listMode === "active"}
      />
    </div>
  )
}
