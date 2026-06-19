"use server"
import { getNavItems as getCachedNavItems } from "@/lib/public-data-cache"

export async function getNavItems() {
  return getCachedNavItems()
}
