"use client"

import { useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

export interface TablePaginationProps {
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  className?: string
}

export function TablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  className,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const visiblePages = useMemo(() => getVisiblePages(page, totalPages), [page, totalPages])

  if (totalItems <= pageSize) return null

  const from = page * pageSize + 1
  const to = Math.min(totalItems, (page + 1) * pageSize)

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t bg-muted/20 px-3 py-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-xs text-muted-foreground sm:text-sm">
        Showing {from}–{to} of {totalItems}
      </p>

      <nav className="flex items-center justify-center gap-1" aria-label="Table pagination">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {visiblePages.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-8 min-w-8 items-center justify-center px-1 text-sm text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Button
              key={item}
              type="button"
              variant={item === page ? "default" : "outline"}
              size="icon"
              className="h-8 w-8 text-xs"
              onClick={() => onPageChange(item)}
              aria-label={`Page ${item + 1}`}
              aria-current={item === page ? "page" : undefined}
            >
              {item + 1}
            </Button>
          )
        )}

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  )
}

export const DEFAULT_TABLE_PAGE_SIZE = 5
