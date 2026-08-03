import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

function normalizeTel(phone: string) {
  const trimmed = phone.trim()
  if (!trimmed) return ""
  const digits = trimmed.replace(/[^\d+]/g, "")
  return digits || trimmed
}

export function PhoneContact({
  phone,
  className,
  mono = true,
}: {
  phone: string
  className?: string
  mono?: boolean
}) {
  const value = phone?.trim()
  if (!value) return <>—</>

  const tel = normalizeTel(value)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success("Phone number copied")
    } catch {
      toast.error("Could not copy phone number")
    }
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <a
        href={`tel:${tel}`}
        className={cn(
          "min-w-0 text-sm text-primary hover:underline break-all whitespace-normal",
          mono && "font-mono"
        )}
      >
        {value}
      </a>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={copy}
        aria-label="Copy phone number"
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  )
}
