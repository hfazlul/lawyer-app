"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ServiceCard } from "@/components/public/service-card"
import type { ServiceGridItem } from "@/types/service-grid"
import type { Language } from "@/types"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 6

function getVisiblePages(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index)
  }

  const pages: (number | "ellipsis")[] = [0]

  if (current > 2) pages.push("ellipsis")

  const start = Math.max(1, current - 1)
  const end = Math.min(total - 2, current + 1)
  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }

  if (current < total - 3) pages.push("ellipsis")

  pages.push(total - 1)
  return pages
}

function ServiceGridPagination({
  currentPage,
  totalPages,
  lang,
  onChange,
}: {
  currentPage: number
  totalPages: number
  lang: Language
  onChange: (page: number) => void
}) {
  const visiblePages = useMemo(
    () => getVisiblePages(currentPage, totalPages),
    [currentPage, totalPages]
  )

  const prevLabel = lang === "bn" ? "আগের পৃষ্ঠা" : "Previous page"
  const nextLabel = lang === "bn" ? "পরের পৃষ্ঠা" : "Next page"

  return (
    <nav
      className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-white/90 p-1.5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)] backdrop-blur-sm"
      aria-label={lang === "bn" ? "সেবা পৃষ্ঠা নেভিগেশন" : "Service page navigation"}
    >
      <button
        type="button"
        aria-label={prevLabel}
        disabled={currentPage === 0}
        onClick={() => onChange(currentPage - 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-1 px-0.5">
        {visiblePages.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-9 min-w-9 items-center justify-center px-1 text-sm text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              aria-label={
                lang === "bn" ? `পৃষ্ঠা ${page + 1}` : `Page ${page + 1}`
              }
              aria-current={page === currentPage ? "page" : undefined}
              onClick={() => onChange(page)}
              className={cn(
                "inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-medium",
                page === currentPage
                  ? "bg-navy text-white shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-navy"
              )}
            >
              {page + 1}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        aria-label={nextLabel}
        disabled={currentPage >= totalPages - 1}
        onClick={() => onChange(currentPage + 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}

export function PaginatedServiceGrid({
  items,
  lang,
  showAppointment = true,
}: {
  items: ServiceGridItem[]
  lang: Language
  showAppointment?: boolean
}) {
  const [page, setPage] = useState(0)

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageItems = items.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  const changePage = (nextPage: number) => {
    if (nextPage < 0 || nextPage >= totalPages || nextPage === safePage) return
    setPage(nextPage)
  }

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pageItems.map((item) => (
          <ServiceCard
            key={`${item.href}-${item.id}`}
            item={item}
            lang={lang}
            showAppointment={showAppointment}
          />
        ))}
      </div>

      {items.length > PAGE_SIZE && (
        <div className="mt-10 flex justify-end">
          <ServiceGridPagination
            currentPage={safePage}
            totalPages={totalPages}
            lang={lang}
            onChange={changePage}
          />
        </div>
      )}
    </div>
  )
}
