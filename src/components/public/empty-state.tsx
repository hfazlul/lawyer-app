import { FileQuestion } from "lucide-react"
import type { Language } from "@/types"

interface EmptyStateProps {
  lang: Language
  title?: { en: string; bn: string }
  description?: { en: string; bn: string }
  className?: string
}

export function EmptyState({
  lang,
  title = { en: "Content coming soon", bn: "কন্টেন্ট শীঘ্রই আসছে" },
  description = {
    en: "We're preparing this section. Please check back later or contact us for assistance.",
    bn: "আমরা এই বিভাগ প্রস্তুত করছি। পরে আবার দেখুন অথবা সহায়তার জন্য যোগাযোগ করুন।",
  },
  className = "",
}: EmptyStateProps) {
  const isBn = lang === "bn"
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-16 text-center ${className}`}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FileQuestion className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        {isBn ? title.bn : title.en}
      </h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {isBn ? description.bn : description.en}
      </p>
    </div>
  )
}
