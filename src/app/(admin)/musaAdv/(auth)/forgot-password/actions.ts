"use server"
import { prisma } from "@/lib/prisma"
import { compare, hash } from "bcryptjs"

export async function resetPassword(data:{secretKey:string,newEmail?:string,newPassword?:string}) {
  const admin = await prisma.admin.findFirst()
  if (!admin || !admin.secretKey) throw new Error("No admin found")
  const isValid = await compare(data.secretKey, admin.secretKey)
  if (!isValid) throw new Error("Invalid recovery code")
  const updateData:any = {}
  if (data.newEmail) updateData.email = data.newEmail
  if (data.newPassword) updateData.password = await hash(data.newPassword,12)
  await prisma.admin.update({where:{id:admin.id},data:updateData})
  return {success:true}
}
