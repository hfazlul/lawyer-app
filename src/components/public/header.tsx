"use client"

import { CmsImage } from "@/components/public/cms-image"
import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import { LanguageToggle } from "./language-toggle"
import { SiteSearch } from "./site-search"
import type { SiteSetting } from "@prisma/client"
import type { Language } from "@/types"
import { t } from "@/lib/dictionary"

interface HeaderProps {
  settings: SiteSetting | null
  lang: Language
}

const logoFrameClass =
  "relative inline-flex h-11 w-11 shrink-0 overflow-hidden rounded-lg ring-1 ring-gold/25 shadow-[0_2px_10px_hsl(var(--navy)/0.14),0_0_16px_hsl(var(--gold)/0.1)] transition-shadow group-hover:shadow-[0_4px_14px_hsl(var(--navy)/0.18),0_0_20px_hsl(var(--gold)/0.14)] sm:h-14 sm:w-14 sm:rounded-xl"

const socialIconBaseClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg shadow-sm transition-all duration-200"

const socialIconGoldClass = `${socialIconBaseClass} bg-gradient-to-br from-gold/20 via-gold/10 to-navy/5 ring-1 ring-gold/20 hover:from-gold/30 hover:via-gold/15 hover:to-navy/10 hover:ring-gold/35 hover:shadow-[0_2px_8px_hsl(var(--gold)/0.2)]`

const socialIconFacebookClass = `${socialIconBaseClass} bg-gradient-to-br from-[#5BADFF] via-[#4A9FF5] to-[#3D94F0] ring-1 ring-[#4A9FF5]/25 shadow-[0_2px_6px_rgba(74,159,245,0.16)] hover:from-[#6BB8FF] hover:via-[#5BADFF] hover:to-[#4A9FF5] hover:ring-[#4A9FF5]/35 hover:shadow-[0_2px_8px_rgba(74,159,245,0.22)]`

const socialIconYoutubeClass = `${socialIconBaseClass} bg-gradient-to-br from-[#FF6666] via-[#FF5252] to-[#F03D3D] ring-1 ring-[#FF5252]/25 shadow-[0_2px_6px_rgba(255,82,82,0.16)] hover:from-[#FF7A7A] hover:via-[#FF6666] hover:to-[#FF5252] hover:ring-[#FF5252]/35 hover:shadow-[0_2px_8px_rgba(255,82,82,0.22)]`

type SocialPlatform = "facebook" | "youtube" | "default"

function getSocialIconClass(platform: SocialPlatform): string {
  switch (platform) {
    case "facebook":
      return socialIconFacebookClass
    case "youtube":
      return socialIconYoutubeClass
    default:
      return socialIconGoldClass
  }
}

const socialIconGlyphClass: Record<SocialPlatform, string> = {
  facebook: "h-3.5 w-3.5 text-white",
  youtube: "h-3.5 w-3.5 text-white",
  default: "h-3.5 w-3.5 text-navy/70 transition-colors hover:text-navy",
}

export function Header({ settings, lang }: HeaderProps) {
  const siteName = t(
    { en: settings?.siteNameEn || "Law Firm", bn: settings?.siteNameBn || "আইন ফার্ম" },
    lang
  )

  return (
    <header className="relative rounded-t-[var(--site-wrapper-radius,1rem)] border-b border-border/60 bg-background">
      <div className="site-chrome flex flex-col gap-3 py-3 sm:gap-4 sm:py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center justify-between gap-2 md:w-auto md:justify-start">
          <Link href="/" className="group flex min-w-0 items-center gap-2 transition-opacity hover:opacity-90 sm:gap-3">
            {settings?.logo ? (
              <span className={logoFrameClass}>
                <CmsImage
                  src={settings.logo}
                  alt={siteName}
                  fill
                  sizes="112px"
                  quality={90}
                  priority
                  className="object-cover object-center"
                />
              </span>
            ) : (
              <span
                className={`${logoFrameClass} items-center justify-center bg-navy font-serif text-lg font-bold text-gold`}
              >
                LF
              </span>
            )}
            <div className="min-w-0">
              <span className="line-clamp-2 font-serif text-sm font-bold leading-tight tracking-tight text-navy sm:text-lg md:text-xl">
                {siteName}
              </span>
              <p className="text-[10px] text-muted-foreground sm:text-xs">
                {lang === "bn" ? "প্রিমিয়াম আইনি সেবা" : "Premium Legal Services"}
              </p>
            </div>
          </Link>
          <div className="md:hidden">
            <SiteSearch enabled={settings?.searchEnabled !== false} mobile />
          </div>
        </div>
        <div className="flex w-full items-center gap-3 md:w-auto md:justify-end">
          <SiteSearch enabled={settings?.searchEnabled !== false} />
          <LanguageToggle initialLang={lang} />
          <div className="flex items-center gap-1.5">
            {settings?.facebook && (
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={getSocialIconClass("facebook")}>
                <Facebook className={socialIconGlyphClass.facebook} />
              </a>
            )}
            {settings?.youtube && (
              <a href={settings.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={getSocialIconClass("youtube")}>
                <Youtube className={socialIconGlyphClass.youtube} />
              </a>
            )}
            {settings?.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={getSocialIconClass("default")}>
                <Instagram className={socialIconGlyphClass.default} />
              </a>
            )}
            {settings?.twitter && (
              <a href={settings.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className={getSocialIconClass("default")}>
                <Twitter className={socialIconGlyphClass.default} />
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
