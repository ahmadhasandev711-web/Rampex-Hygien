import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductToolbar } from "@/components/products/ProductToolbar";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { localeAlternates } from "@/lib/seo";
import { fetchProducts } from "@/lib/woocommerce/store";

type ProductsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; sale?: string; sort?: string }>;
};

export async function generateMetadata({
  params,
}: ProductsPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = getDictionary(raw);
  return {
    title: dict.products.title,
    description: dict.products.subtitle,
    alternates: localeAlternates(raw, "/products"),
  };
}

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const { q, sale, sort = "name" } = await searchParams;

  const orderby =
    sort === "newest"
      ? "date"
      : sort === "price-asc" || sort === "price-desc"
        ? "price"
        : "title";
  const order =
    sort === "price-desc" || sort === "newest" ? "desc" : "asc";

  const products = await fetchProducts({
    perPage: 24,
    orderby,
    order,
    onSale: sale === "1",
    search: q?.trim() || undefined,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      <div className="mb-10 max-w-2xl">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-navy sm:text-5xl">
          {dict.products.title}
        </h1>
        <p className="mt-3 text-muted">{dict.products.subtitle}</p>
      </div>
      <Suspense fallback={null}>
        <ProductToolbar locale={locale} dict={dict} />
      </Suspense>
      <ProductGrid products={products} locale={locale} dict={dict} />
    </div>
  );
}
