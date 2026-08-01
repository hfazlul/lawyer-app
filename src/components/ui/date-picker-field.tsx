"use client"

import { useState } from "react"
import { format, isValid, parseISO } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

function parseDateValue(value: string) {
  if (!value) return undefined
  const parsed = parseISO(value)
  return isValid(parsed) ? parsed : undefined
}

export function DatePickerField({
  id,
  value,
  onChange,
  placeholder = "Select date",
  className,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = parseDateValue(value)

  return (
    <div className={cn("space-y-2", className)}>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !value && "text-muted-foreground"
        )}
      >
        <span className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 shrink-0 text-primary" />
          {selected ? format(selected, "dd MMM yyyy") : placeholder}
        </span>
        {value ? (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear date"
            className="rounded-sm p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={(event) => {
              event.stopPropagation()
              onChange("")
              setOpen(false)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                event.stopPropagation()
                onChange("")
                setOpen(false)
              }
            }}
          >
            <X className="h-4 w-4" />
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              onChange(date ? format(date, "yyyy-MM-dd") : "")
              setOpen(false)
            }}
            defaultMonth={selected}
            initialFocus
            className="mx-auto w-full"
          />
          {selected ? (
            <p className="border-t border-border/60 px-3 py-2 text-center text-xs text-muted-foreground">
              Selected: <span className="font-medium text-navy">{format(selected, "EEEE, d MMMM yyyy")}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
