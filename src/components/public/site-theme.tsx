import { buildSiteThemeCss } from "@/lib/site-theme"

export function SiteTheme({
  themeNavy,
  themeGold,
}: {
  themeNavy?: string | null
  themeGold?: string | null
}) {
  const css = buildSiteThemeCss(themeNavy, themeGold)
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
