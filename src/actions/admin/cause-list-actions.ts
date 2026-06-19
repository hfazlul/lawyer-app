"use server"
import { prisma } from "@/lib/prisma"
export async function getTodayCases() {
  const today = new Date(); today.setHours(0,0,0,0); const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1)
  return await prisma.case.findMany({ where: { nextDate: { gte: today, lt: tomorrow }, status: "active" }, orderBy: { nextDate: "asc" } })
}
export async function getNextDayCases() {
  const tomorrow = new Date(); tomorrow.setHours(0,0,0,0); tomorrow.setDate(tomorrow.getDate()+1)
  return await prisma.case.findMany({ where: { nextDate: { gte: tomorrow }, status: "active" }, orderBy: { nextDate: "asc" } })
}
