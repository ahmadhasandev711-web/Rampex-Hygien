import { ProductCard } from "@/components/products/ProductCard";
import type { WooProduct } from "@/lib/woocommerce/types";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

type ProductGridProps = {
  products: WooProduct[];
  locale: Locale;
  dict: Dictionary;
  /** How many leading cards get priority image loading (default 4). */
  priorityCount?: number;
};

export function ProductGrid({
  products,
  locale,
  dict,
  priorityCount = 4,
}: ProductGridProps) {
  if (!products.length) {
    return (
      <p className="py-16 text-center text-muted">{dict.products.empty}</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          locale={locale}
          dict={dict}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
