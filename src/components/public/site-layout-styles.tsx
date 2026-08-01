import { buildSiteLayoutCss } from "@/lib/site-layout"

export function SiteLayoutStyles({
  layoutFullWidth,
  layoutMargin,
}: {
  layoutFullWidth?: boolean | null
  layoutMargin?: number | null
}) {
  const css = buildSiteLayoutCss(layoutFullWidth, layoutMargin)
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
