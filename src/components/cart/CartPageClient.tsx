"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { cartItemVariationLines } from "@/lib/woocommerce/cart-display";
import { formatWooPrice } from "@/lib/woocommerce/format";

type CartPageClientProps = {
  locale: Locale;
};

export function CartPageClient({ locale }: CartPageClientProps) {
  const dict = getDictionary(locale);
  const { cart, isLoading, isPending, updateItem, removeItem } = useCart();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-muted">
        {dict.loading}
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-navy">
          {dict.cart.title}
        </h1>
        <p className="mt-4 text-muted">{dict.cart.empty}</p>
        <Link
          href={`/${locale}/products`}
          className="mt-8 inline-flex min-h-12 items-center bg-lime px-6 text-sm font-bold uppercase tracking-wide text-navy-deep"
        >
          {dict.cart.continue}
        </Link>
      </div>
    );
  }

  const subtotal = formatWooPrice(cart.totals.total_items, cart.totals);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-16">
      <h1 className="mb-10 font-[family-name:var(--font-display)] text-3xl font-bold text-navy sm:text-4xl">
        {dict.cart.title}
      </h1>

      <ul className="divide-y divide-line border-y border-line">
        {cart.items.map((item) => {
          const image = item.images[0];
          const lineTotal = formatWooPrice(
            item.totals.line_total,
            item.totals,
          );
          const variations = cartItemVariationLines(item);

          return (
            <li key={item.key} className="flex gap-4 py-6 sm:gap-6">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-white sm:h-28 sm:w-28">
                {image ? (
                  <Image
                    src={image.thumbnail || image.src}
                    alt={image.alt || item.name}
                    fill
                    className="object-contain p-2"
                    sizes="112px"
                  />
                ) : null}
              </div>

              <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-navy">{item.name}</h2>
                    {variations.length > 0 ? (
                      <ul className="mt-1.5 space-y-0.5">
                        {variations.map((line) => (
                          <li
                            key={line}
                            className="text-sm capitalize text-muted"
                          >
                            {line}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <span className="font-bold text-navy">{lineTotal}</span>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-muted">
                    <span>{dict.cart.quantity}</span>
                    <input
                      type="number"
                      min={item.quantity_limits.minimum}
                      max={item.quantity_limits.maximum}
                      value={item.quantity}
                      disabled={isPending || !item.quantity_limits.editable}
                      onChange={(e) => {
                        const qty = Number(e.target.value);
                        if (Number.isFinite(qty) && qty > 0) {
                          void updateItem(item.key, qty);
                        }
                      }}
                      className="w-16 border border-line bg-white px-2 py-1 text-navy"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => void removeItem(item.key)}
                    className="text-sm font-semibold text-muted underline underline-offset-2 hover:text-navy"
                  >
                    {dict.cart.remove}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-col items-end gap-4">
        <div className="flex items-baseline gap-3 text-lg">
          <span className="text-muted">{dict.cart.subtotal}</span>
          <span className="text-2xl font-bold text-navy">{subtotal}</span>
        </div>
        <Link
          href={`/${locale}/checkout`}
          className="inline-flex min-h-12 items-center bg-navy px-8 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-navy-soft"
        >
          {dict.cart.checkout}
        </Link>
        <Link
          href={`/${locale}/products`}
          className="text-sm font-semibold text-navy underline decoration-lime decoration-2 underline-offset-4"
        >
          {dict.cart.continue}
        </Link>
      </div>
    </div>
  );
}
