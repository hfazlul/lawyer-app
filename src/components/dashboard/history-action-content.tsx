import { STEPS_HISTORY_PREFIX } from "@/lib/case-helpers"
import { StepsHtmlContent } from "@/components/dashboard/steps-html-content"

export function isStepsHistoryAction(action: string) {
  return action === "steps_cleared" || action.startsWith(STEPS_HISTORY_PREFIX)
}

export function HistoryActionContent({ action }: { action: string }) {
  if (action === "steps_cleared") {
    return <p className="italic text-muted-foreground">Steps cleared</p>
  }

  if (action.startsWith(STEPS_HISTORY_PREFIX)) {
    const html = action.slice(STEPS_HISTORY_PREFIX.length)
    return (
      <div className="space-y-2">
        <p className="font-medium text-foreground">Steps updated</p>
        <StepsHtmlContent html={html} className="text-sm text-foreground" />
      </div>
    )
  }

  const stepsMarker = "Steps: "
  const stepsIndex = action.indexOf(stepsMarker)
  if (stepsIndex >= 0) {
    const before = action.slice(0, stepsIndex).trim().replace(/\.\s*$/, "")
    const stepsContent = action.slice(stepsIndex + stepsMarker.length).trim()

    return (
      <div className="space-y-2">
        {before ? <p>{before}</p> : null}
        <p className="font-medium text-foreground">Steps</p>
        <StepsHtmlContent html={stepsContent} className="text-sm text-foreground" />
      </div>
    )
  }

  return <p className="leading-relaxed">{action}</p>
}
