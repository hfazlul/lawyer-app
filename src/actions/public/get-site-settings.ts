"use server"
import { getSiteSettings as getCachedSiteSettings } from "@/lib/public-data-cache"

export async function getSiteSettings() {
  return getCachedSiteSettings()
}
