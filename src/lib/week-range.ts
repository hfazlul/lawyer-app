/** Bangladesh court week: Sunday through Thursday (inclusive). */
export function getSunThuWeekRange(reference = new Date()): { start: Date; end: Date } {
  const day = reference.getDay()
  const start = new Date(reference)
  start.setDate(reference.getDate() - day)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 4)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}
