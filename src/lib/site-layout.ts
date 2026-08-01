export const DEFAULT_LAYOUT_MARGIN = 16
export const MIN_LAYOUT_MARGIN = 0
export const MAX_LAYOUT_MARGIN = 48

export function resolveLayoutMargin(value?: number | null) {
  if (value == null || Number.isNaN(value)) return DEFAULT_LAYOUT_MARGIN
  return Math.min(MAX_LAYOUT_MARGIN, Math.max(MIN_LAYOUT_MARGIN, value))
}

export function buildSiteLayoutCss(fullWidth?: boolean | null, marginPx?: number | null): string {
  if (fullWidth) {
    return `
      .site-shell {
        --site-shell-px: 0px;
        --site-shell-py: 0px;
        --site-wrapper-radius: 0px;
        --site-max-width: 100%;
      }
    `.trim()
  }

  const margin = resolveLayoutMargin(marginPx)
  return `
    .site-shell {
      --site-shell-px: ${margin}px;
      --site-shell-py: ${Math.max(8, Math.round(margin * 0.75))}px;
      --site-wrapper-radius: 1rem;
      --site-max-width: 1440px;
    }
    @media (min-width: 768px) {
      .site-shell {
        --site-shell-px: ${margin}px;
        --site-shell-py: ${Math.max(12, Math.round(margin * 0.9))}px;
        --site-wrapper-radius: 1rem;
      }
    }
  `.trim()
}
