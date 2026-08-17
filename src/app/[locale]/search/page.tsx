import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/products/ProductGrid";
import { SearchForm } from "@/components/search/SearchForm";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { localeAlternates, noIndexRobots } from "@/lib/seo";
import { fetchProducts } from "@/lib/woocommerce/store";

type SearchPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = getDictionary(raw);
  const { q } = await searchParams;
  const query = q?.trim();
  return {
    title: query
      ? `${dict.searchPage.title}: ${query}`
      : dict.searchPage.title,
    description: dict.searchPage.subtitle,
    alternates: localeAlternates(raw, "/search"),
    robots: noIndexRobots(),
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const products = query
    ? await fetchProducts({
        perPage: 24,
        orderby: "title",
        order: "asc",
        search: query,
      })
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-deep">
          {dict.brand}
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-navy sm:text-5xl">
          {dict.searchPage.title}
        </h1>
        <p className="mt-3 text-muted">{dict.searchPage.subtitle}</p>
      </div>

      <Suspense fallback={null}>
        <SearchForm
          locale={locale}
          dict={dict}
          defaultQuery={query}
          autoFocus={!query}
          large
        />
      </Suspense>

      <div className="mt-12">
        {query ? (
          <>
            <p className="mb-8 text-sm text-muted">
              {dict.searchPage.resultsFor}{" "}
              <span className="font-semibold text-navy">&ldquo;{query}&rdquo;</span>
            </p>
            {products.length ? (
              <ProductGrid
                products={products}
                locale={locale}
                dict={dict}
                priorityCount={4}
              />
            ) : (
              <p className="py-16 text-center text-muted">
                {dict.searchPage.emptyResults}
              </p>
            )}
          </>
        ) : (
          <p className="py-16 text-center text-muted">
            {dict.searchPage.emptyQuery}
          </p>
        )}
      </div>
    </div>
  );
}
