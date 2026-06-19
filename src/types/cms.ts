export type Language = "en" | "bn"
export type ContentStatus = "active" | "archived" | "draft"
export type MessageStatus = "unread" | "read"

export interface BilingualText {
  en: string
  bn: string
}

export type NavItemPublic = {
  id: number
  labelEn: string
  labelBn: string
  href: string
  sortOrder: number
}
