"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { searchSite, type SearchResult } from "@/actions/public/search-site"
import { useLanguage } from "@/hooks/use-language"
import { t } from "@/lib/dictionary"
import { cn } from "@/lib/utils"

interface SiteSearchProps {
  enabled?: boolean
  className?: string
  mobile?: boolean
}

export function SiteSearch({ enabled = true, className, mobile = false }: SiteSearchProps) {
  const { lang } = useLanguage()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const runSearch = useCallback(
    async (value: string) => {
      if (value.trim().length < 2) {
        setResults([])
        return
      }
      setLoading(true)
      const data = await searchSite(value, lang)
      setResults(data)
      setLoading(false)
    },
    [lang]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      if (open || expanded) runSearch(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, open, expanded, runSearch])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        if (mobile) setExpanded(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [mobile])

  if (!enabled) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setOpen(false)
      setExpanded(false)
    }
  }

  const input = (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={lang === "bn" ? "অনুসন্ধান..." : "Search services & pages..."}
        className={cn("pl-9 pr-9", mobile && "h-10")}
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("")
            setResults([])
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  )

  if (mobile) {
    return (
      <div ref={containerRef} className={className}>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
          aria-label={lang === "bn" ? "অনুসন্ধান" : "Search"}
        >
          <Search className="h-5 w-5" />
        </button>
        {expanded && (
          <div className="absolute left-0 right-0 top-full z-50 border-b bg-background p-4 shadow-lg md:hidden">
            {input}
            {open && query.length >= 2 && (
              <SearchDropdown results={results} loading={loading} lang={lang} onSelect={() => { setOpen(false); setExpanded(false) }} />
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn("relative hidden flex-1 max-w-xs sm:block", className)}>
      {input}
      {open && query.length >= 2 && (
        <SearchDropdown results={results} loading={loading} lang={lang} onSelect={() => setOpen(false)} />
      )}
    </div>
  )
}

function SearchDropdown({
  results,
  loading,
  lang,
  onSelect,
}: {
  results: SearchResult[]
  loading: boolean
  lang: "en" | "bn"
  onSelect: () => void
}) {
  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-auto rounded-md border bg-popover shadow-lg">
      {loading && (
        <p className="px-4 py-3 text-sm text-muted-foreground">
          {lang === "bn" ? "অনুসন্ধান করা হচ্ছে..." : "Searching..."}
        </p>
      )}
      {!loading && results.length === 0 && (
        <p className="px-4 py-3 text-sm text-muted-foreground">
          {lang === "bn" ? "কোনো ফলাফল নেই" : "No results found"}
        </p>
      )}
      {!loading &&
        results.map((item, i) => (
          <Link
            key={`${item.href}-${i}`}
            href={item.href}
            onClick={onSelect}
            className="block border-b px-4 py-3 last:border-0 hover:bg-muted/60"
          >
            <p className="text-sm font-medium">
              {t({ en: item.titleEn, bn: item.titleBn }, lang)}
            </p>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {t({ en: item.excerptEn, bn: item.excerptBn }, lang)}
            </p>
          </Link>
        ))}
    </div>
  )
}
