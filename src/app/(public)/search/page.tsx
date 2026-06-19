import type { Metadata } from "next"
import Link from "next/link"
import { getLangFromCookies } from "@/lib/lang"
import { buildPublicMetadata } from "@/lib/public-metadata"
import { searchSite } from "@/actions/public/search-site"
import { PageBanner } from "@/components/public/page-banner"
import { EmptyState } from "@/components/public/empty-state"
import { t } from "@/lib/dictionary"

export const dynamic = "force-dynamic"

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLangFromCookies()
  return buildPublicMetadata("search", lang)
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const [{ q }, lang] = await Promise.all([searchParams, getLangFromCookies()])
  const query = q?.trim() || ""
  const results = query.length >= 2 ? await searchSite(query, lang) : []

  return (
    <>
      <PageBanner
        title={{ en: "Search Results", bn: "অনুসন্ধানের ফলাফল" }}
        subtitle={{
          en: query ? `Showing results for "${query}"` : "Enter a search term in the header",
          bn: query ? `"${query}" এর জন্য ফলাফল` : "হেডারে অনুসন্ধান শব্দ লিখুন",
        }}
        lang={lang}
      />
      <section className="py-20">
        <div className="container mx-auto max-w-3xl px-4">
          {query.length < 2 ? (
            <EmptyState
              lang={lang}
              title={{ en: "Start searching", bn: "অনুসন্ধান শুরু করুন" }}
              description={{
                en: "Type at least 2 characters in the search bar to find services and pages.",
                bn: "সেবা ও পৃষ্ঠা খুঁজতে অনুসন্ধান বারে কমপক্ষে ২ অক্ষর লিখুন।",
              }}
            />
          ) : results.length === 0 ? (
            <EmptyState
              lang={lang}
              title={{ en: "No results found", bn: "কোনো ফলাফল নেই" }}
              description={{
                en: `We couldn't find anything matching "${query}". Try different keywords.`,
                bn: `"${query}" এর সাথে মিলে যাওয়া কিছু পাওয়া যায়নি। অন্য শব্দ চেষ্টা করুন।`,
              }}
            />
          ) : (
            <ul className="space-y-4">
              {results.map((item, i) => (
                <li key={`${item.href}-${i}`}>
                  <Link
                    href={item.href}
                    className="block rounded-lg border border-border/60 bg-card p-5 transition-all hover:border-gold/40 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-serif text-lg font-semibold text-navy">
                        {t({ en: item.titleEn, bn: item.titleBn }, lang)}
                      </h3>
                      <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-medium text-navy">
                        {item.type === "service"
                          ? lang === "bn"
                            ? "সেবা"
                            : "Service"
                          : lang === "bn"
                            ? "পৃষ্ঠা"
                            : "Page"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {t({ en: item.excerptEn, bn: item.excerptBn }, lang)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}
