export function resolveBannerText(
  title: { en?: string | null; bn?: string | null },
  subtitle: { en?: string | null; bn?: string | null } | undefined,
  fallbacks: {
    title: { en: string; bn: string }
    subtitle?: { en: string; bn: string }
  }
) {
  const resolvedTitle = {
    en: title.en?.trim() || fallbacks.title.en,
    bn: title.bn?.trim() || fallbacks.title.bn,
  }

  const subtitleFallback = fallbacks.subtitle
  const resolvedSubtitle =
    subtitleFallback &&
    (subtitle?.en?.trim() || subtitle?.bn?.trim() || subtitleFallback.en || subtitleFallback.bn)
      ? {
          en: subtitle?.en?.trim() || subtitleFallback.en,
          bn: subtitle?.bn?.trim() || subtitleFallback.bn,
        }
      : undefined

  return { title: resolvedTitle, subtitle: resolvedSubtitle }
}
