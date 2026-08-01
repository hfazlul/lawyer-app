import DOMPurify from "isomorphic-dompurify"
import { cn } from "@/lib/utils"

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ol",
  "ul",
  "li",
  "h2",
  "h3",
  "blockquote",
]

export function CmsHtmlContent({
  html,
  className,
}: {
  html: string
  className?: string
}) {
  if (!html.trim()) return null

  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(html)
  if (!looksLikeHtml) {
    return (
      <div className={cn("leading-relaxed text-muted-foreground whitespace-pre-wrap", className)}>
        {html}
      </div>
    )
  }

  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS })

  return (
    <div
      className={cn("cms-prose leading-relaxed text-muted-foreground", className)}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
}
