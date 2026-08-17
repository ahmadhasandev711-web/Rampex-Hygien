import Link from "next/link";
import { ProductGrid } from "@/components/products/ProductGrid";
import type { WooProduct } from "@/lib/woocommerce/types";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

type ProductSectionProps = {
  title: string;
  subtitle: string;
  products: WooProduct[];
  locale: Locale;
  dict: Dictionary;
  viewAllHref?: string;
  /** Eager-load leading product images when this section can be LCP. */
  priorityCount?: number;
};

export function ProductSection({
  title,
  subtitle,
  products,
  locale,
  dict,
  viewAllHref,
  priorityCount = 0,
}: ProductSectionProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            {title}
          </h2>
          <p className="mt-2 text-muted">{subtitle}</p>
        </div>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="text-sm font-bold uppercase tracking-wide text-navy underline decoration-lime decoration-2 underline-offset-4 transition hover:text-lime-deep"
          >
            {dict.sections.viewAll}
          </Link>
        ) : null}
      </div>
      <ProductGrid
        products={products}
        locale={locale}
        dict={dict}
        priorityCount={priorityCount}
      />
    </section>
  );
}
