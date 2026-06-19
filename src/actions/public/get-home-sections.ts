"use server"
import { getHomeSections as getCachedHomeSections } from "@/lib/public-data-cache"

export async function getHomeSections() {
  return getCachedHomeSections()
}
