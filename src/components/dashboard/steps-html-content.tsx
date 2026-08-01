import { CmsHtmlContent } from "@/components/public/cms-html-content"
import { normalizeStepsHtml } from "@/lib/steps-format"
import { cn } from "@/lib/utils"

export function StepsHtmlContent({
  html,
  className,
}: {
  html: string
  className?: string
}) {
  return <CmsHtmlContent html={normalizeStepsHtml(html)} className={className} />
}
