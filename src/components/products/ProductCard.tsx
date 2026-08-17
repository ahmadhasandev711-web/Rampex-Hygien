"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { formatWooPrice } from "@/lib/woocommerce/format";
import type { WooProduct } from "@/lib/woocommerce/types";
import { formatProductPriceLabel } from "@/lib/woocommerce/variations";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

type ProductCardProps = {
  product: WooProduct;
  locale: Locale;
  dict: Dictionary;
  /** Eager-load above-the-fold thumbnails (LCP). */
  priority?: boolean;
};

export function ProductCard({
  product,
  locale,
  dict,
  priority = false,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const image = product.images[0];
  const href = `/${locale}/products/${product.slug}`;
  const price = formatProductPriceLabel(product, formatWooPrice);
  const needsOptions =
    product.type === "variable" || product.has_options === true;
  const canBuy =
    !needsOptions && product.is_purchasable && product.is_in_stock;

  const hasRange =
    product.prices.price_range &&
    product.prices.price_range.min_amount !==
      product.prices.price_range.max_amount;
  const regular =
    !hasRange &&
    product.on_sale &&
    product.prices.regular_price !== product.prices.price
      ? formatWooPrice(product.prices.regular_price, product.prices)
      : null;

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-lime/70 hover:shadow-[0_12px_24px_rgba(26,39,87,0.08)]">
      <Link
        href={href}
        className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#f4f7f1] transition-colors duration-300 group-hover:bg-[#ebf4e5]"
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt || product.name}
            fill
            priority={priority}
            loading={priority ? "eager" : undefined}
            className="object-contain p-4 transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-lime-soft text-sm text-muted">
            {dict.brand}
          </div>
        )}
        {product.on_sale ? (
          <span className="absolute start-2.5 top-2.5 rounded-md bg-lime px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-navy-deep shadow-xs">
            {dict.products.onSale}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-1 px-1 pb-2 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {dict.brand}
        </p>
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-navy transition group-hover:text-navy-soft sm:text-base">
          <Link href={href}>
            {product.name}
          </Link>
        </h3>
      </div>

      <div className="mt-auto pt-2">
        {error ? (
          <p className="mb-2 px-1 text-xs text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="flex min-w-0 flex-col">
            {regular ? (
              <span className="text-[11px] text-muted line-through">{regular}</span>
            ) : null}
            <span className="truncate text-sm font-extrabold text-navy sm:text-base">
              {price}
            </span>
          </div>

          {needsOptions ? (
            <Link
              href={href}
              className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-navy px-3 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-navy-soft sm:px-4 sm:text-xs"
            >
              {dict.products.selectOptions}
            </Link>
          ) : (
            <button
              type="button"
              disabled={!canBuy || pending}
              onClick={() => {
                if (!canBuy) return;
                setError(null);
                startTransition(async () => {
                  const result = await addItem(product.id, 1);
                  if (result.ok) {
                    setDone(true);
                    window.setTimeout(() => setDone(false), 1400);
                  } else {
                    setError(result.message || dict.error);
                  }
                });
              }}
              className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-lime px-3 text-[11px] font-bold uppercase tracking-wide text-navy-deep transition hover:bg-lime-deep hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-xs"
            >
              {pending ? (
                <span className="inline-flex items-center gap-1.5">
                  <svg
                    className="h-3.5 w-3.5 animate-spin text-navy-deep"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>{dict.cart.updating}</span>
                </span>
              ) : done ? (
                dict.added
              ) : !canBuy ? (
                dict.products.outOfStock
              ) : (
                dict.products.addToCart
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
