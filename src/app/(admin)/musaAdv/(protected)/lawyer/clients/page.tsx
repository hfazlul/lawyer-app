import { redirect } from "next/navigation"
import { adminPath } from "@/lib/constants"

export default function ClientsPage() {
  redirect(adminPath("lawyer"))
}
