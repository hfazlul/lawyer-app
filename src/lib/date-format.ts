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

/** YYYY-MM-DD in Asia/Dhaka — use for hearing-date filters */
export function toAppDateKey(value: Date | string | number): string {
  const date = toDate(value)
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

export function appDateKeyToDate(key: string): Date {
  const [year, month, day] = key.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function isSameAppDay(
  a: Date | string | number,
  b: Date | string | number
): boolean {
  return toAppDateKey(a) === toAppDateKey(b)
}

export function startOfAppToday(): Date {
  return appDateKeyToDate(toAppDateKey(new Date()))
}
