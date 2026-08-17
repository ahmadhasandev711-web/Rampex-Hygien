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
    <article className="group flex h-full flex-col bg-white">
      <Link
        href={href}
        className="relative aspect-[4/5] overflow-hidden bg-white"
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt || product.name}
            fill
            priority={priority}
            loading={priority ? "eager" : undefined}
            className="object-contain p-4 transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-lime-soft text-sm text-muted">
            {dict.brand}
          </div>
        )}
        {product.on_sale ? (
          <span className="absolute start-3 top-3 bg-lime px-2 py-1 text-xs font-bold uppercase tracking-wide text-navy-deep">
            {dict.products.onSale}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-2 px-3 pb-1 pt-3 sm:px-4">
        <h3 className="text-base font-semibold leading-snug text-navy">
          <Link href={href} className="transition hover:text-navy-soft">
            {product.name}
          </Link>
        </h3>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {dict.brand}
        </p>
      </div>

      <div className="mt-auto">
        {error ? (
          <p className="border-t border-line px-3 py-1.5 text-xs text-red-700 sm:px-4">
            {error}
          </p>
        ) : null}
        <div className="flex items-stretch border-t border-line">
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-3 py-3 sm:px-4">
          {regular ? (
            <span className="text-xs text-muted line-through">{regular}</span>
          ) : null}
          <span className="truncate text-sm font-bold text-navy sm:text-base">
            {price}
          </span>
        </div>

        <div className="w-px self-stretch bg-line" aria-hidden />

        {needsOptions ? (
          <Link
            href={href}
            className="inline-flex min-h-12 shrink-0 items-center justify-center bg-navy px-3 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-navy-soft sm:px-4 sm:text-xs"
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
            className="inline-flex min-h-12 shrink-0 items-center justify-center bg-lime px-3 text-[11px] font-bold uppercase tracking-wide text-navy-deep transition hover:bg-lime-deep hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-xs"
          >
            {pending
              ? dict.cart.updating
              : done
                ? dict.added
                : !canBuy
                  ? dict.products.outOfStock
                  : dict.products.addToCart}
          </button>
        )}
        </div>
      </div>
    </article>
  );
}
