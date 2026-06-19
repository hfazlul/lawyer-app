const LOCALE = "en-US"
const TIMEZONE = "Asia/Dhaka"

function toDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value)
}

export function formatAppDate(value: Date | string | number | null | undefined): string {
  if (value == null) return "—"
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date)
}

export function formatAppDateTime(value: Date | string | number | null | undefined): string {
  if (value == null) return "—"
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date)
}
