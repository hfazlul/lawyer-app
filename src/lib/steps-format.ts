function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function toListItems(items: string[]): string {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`
}

/** Turn plain or partial HTML steps into a bullet/ordered list for display */
export function normalizeStepsHtml(content: string): string {
  const trimmed = content.trim()
  if (!trimmed) return ""

  if (/<ul[\s>]|<ol[\s>]/i.test(trimmed)) {
    return trimmed
  }

  if (/<li[\s>]/i.test(trimmed)) {
    return `<ul>${trimmed}</ul>`
  }

  const paragraphMatches = [...trimmed.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
  if (paragraphMatches.length > 1) {
    const items = paragraphMatches.map((m) => stripHtmlTags(m[1])).filter(Boolean)
    if (items.length > 1) return toListItems(items)
  }

  const plain = /<[a-z][\s\S]*>/i.test(trimmed) ? stripHtmlTags(trimmed) : trimmed

  const bulletLines = plain
    .split(/\n+/)
    .map((line) => line.replace(/^[\s•\-–*]+/, "").trim())
    .filter(Boolean)
  if (bulletLines.length > 1) {
    return toListItems(bulletLines)
  }

  const sentences = plain
    .split(/(?<=\.)\s+(?=[A-Z(“"'\[])/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (sentences.length > 1) {
    return toListItems(sentences)
  }

  return trimmed.startsWith("<") ? trimmed : `<p>${plain}</p>`
}
