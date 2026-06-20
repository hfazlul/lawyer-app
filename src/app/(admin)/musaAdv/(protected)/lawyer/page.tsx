import { redirect } from "next/navigation"
import { adminPath } from "@/lib/constants"

export default function LawyerIndex() {
  redirect(adminPath("lawyer/clients"))
}
