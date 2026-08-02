"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState, useRef } from "react"
import type { SiteSetting } from "@prisma/client"
import type { Language } from "@/types"
import { t } from "@/lib/dictionary"
import { Button } from "@/components/ui/button"

interface NavItem {
  id: number
  labelEn: string
  labelBn: string
  href: string
  sortOrder: number
}

export function Navigation({
  settings: _settings,
  lang,
  navItems,
}: {
  settings: SiteSetting | null
  lang: Language
  navItems: NavItem[]
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isStuck, setIsStuck] = useState(false)
  const [navHeight, setNavHeight] = useState(0)
  const navRef = useRef<HTMLElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = navRef.current
    if (!node) return

    const update = () => {
      const height = node.offsetHeight
      setNavHeight(height)
      document.documentElement.style.setProperty("--site-nav-height", `${height}px`)
    }

    update()
    const resizeObserver = new ResizeObserver(update)
    resizeObserver.observe(node)
    window.addEventListener("resize", update)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [mobileOpen])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  const navLink = (item: NavItem, mobile = false) => {
    const active = pathname === item.href
    return (
      <Link
        key={item.id}
        href={item.href}
        className={cn(
          "block font-medium tracking-wide transition-all duration-300 ease-out",
          mobile
            ? cn(
                "rounded-lg px-4 py-4 text-base",
                active
                  ? "bg-gradient-to-r from-gold/20 to-gold/5 font-semibold text-navy ring-1 ring-gold/25"
                  : "text-foreground hover:bg-gradient-to-r hover:from-muted/60 hover:to-gold/5"
              )
            : cn(
                "inline-flex w-[8rem] shrink-0 items-center justify-center rounded-md px-3 py-3.5 text-center text-sm tracking-wider",
                active
                  ? "bg-gradient-to-b from-navy/95 via-navy to-navy/85 font-semibold text-white shadow-[0_2px_12px_hsl(var(--navy)/0.2)] ring-1 ring-gold/25"
                  : "bg-gradient-to-b from-transparent via-gold/[0.04] to-gold/[0.08] text-muted-foreground hover:from-gold/10 hover:via-gold/5 hover:to-navy/[0.06] hover:text-navy hover:shadow-[0_2px_10px_hsl(var(--navy)/0.08)]"
              )
        )}
      >
        {t({ en: item.labelEn, bn: item.labelBn }, lang)}
      </Link>
    )
  }

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full shrink-0" aria-hidden />
      {isStuck && <div aria-hidden style={{ height: navHeight }} className="shrink-0" />}
      <nav
        ref={navRef}
        className={cn(
          "site-sticky-nav z-50 border-b border-gold/10 bg-background shadow-[0_4px_20px_-8px_hsl(var(--navy)/0.12)] supports-[backdrop-filter]:bg-background/95 supports-[backdrop-filter]:backdrop-blur-md",
          isStuck && "site-sticky-nav--fixed"
        )}
      >
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
          aria-hidden
        />
        <div className="site-chrome">
          <div className="flex items-center justify-between md:hidden">
            <span className="py-3 font-serif text-sm font-semibold tracking-wide text-navy">
              {lang === "bn" ? "মেনু" : "Menu"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="text-navy hover:bg-gold/10"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          <ul className="hidden gap-1 py-3 md:flex">
            {navItems.map((item) => (
              <li key={item.id} className="shrink-0">
                {navLink(item)}
              </li>
            ))}
          </ul>
        </div>

        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 top-[var(--site-nav-height,3.5rem)] z-40 bg-navy/30 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <div className="absolute left-0 right-0 z-40 border-b border-gold/10 bg-background/95 p-4 shadow-lg backdrop-blur-md md:hidden animate-in slide-in-from-top-2">
              <ul className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <li key={item.id}>{navLink(item, true)}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </nav>
    </>
  )
}
