"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { WishlistButton } from "@/components/products/WishlistButton";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  isColorAttribute,
  isLightSwatch,
  isSizeAttribute,
  resolveSwatchColor,
} from "@/lib/woocommerce/attribute-ui";
import { formatWooPrice } from "@/lib/woocommerce/format";
import type { WooProduct, WooProductAttribute } from "@/lib/woocommerce/types";
import {
  findMatchingVariation,
  formatProductPriceLabel,
  variationAttributes,
} from "@/lib/woocommerce/variations";

type ProductDetailClientProps = {
  product: WooProduct;
  variations: WooProduct[];
  dict: Dictionary;
};

function selectedLabel(
  attr: WooProductAttribute,
  selected: Record<string, string>,
) {
  const slug = selected[attr.name];
  if (!slug) return null;
  return attr.terms.find((t) => t.slug === slug)?.name ?? slug;
}

export function ProductDetailClient({
  product,
  variations,
  dict,
}: ProductDetailClientProps) {
  const { addItem } = useCart();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const attrs = variationAttributes(product);
  const isVariable = product.type === "variable" || product.has_options === true;

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const attr of attrs) {
      initial[attr.name] = "";
    }
    return initial;
  });
  const [activeImageId, setActiveImageId] = useState<number | null>(null);

  const matched = useMemo(
    () => findMatchingVariation(product, variations, selected),
    [product, variations, selected],
  );

  const display = matched ?? product;
  const gallery = product.images.length
    ? product.images
    : display.images[0]
      ? [display.images[0]]
      : [];
  const image =
    gallery.find((img) => img.id === activeImageId) ??
    display.images[0] ??
    product.images[0];

  const priceLabel = matched
    ? formatWooPrice(matched.prices.price, matched.prices)
    : formatProductPriceLabel(product, formatWooPrice);

  const regular =
    matched &&
    matched.on_sale &&
    matched.prices.regular_price !== matched.prices.price
      ? formatWooPrice(matched.prices.regular_price, matched.prices)
      : !matched &&
          product.on_sale &&
          product.prices.regular_price !== product.prices.price
        ? formatWooPrice(product.prices.regular_price, product.prices)
        : null;

  const inStock = matched
    ? matched.is_in_stock && matched.is_purchasable
    : !isVariable && product.is_in_stock && product.is_purchasable;

  const canAdd = isVariable
    ? Boolean(matched && matched.is_purchasable && matched.is_in_stock)
    : product.is_purchasable && product.is_in_stock;

  const addId = matched?.id ?? product.id;
  const max = 99;

  function clamp(value: number) {
    return Math.min(max, Math.max(1, value));
  }

  function pick(attrName: string, slug: string) {
    setError(null);
    setSelected((prev) => ({ ...prev, [attrName]: slug }));
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      <div>
        <div className="relative aspect-square overflow-hidden bg-white">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt || product.name}
              fill
              priority
              className="object-contain p-6"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : null}
          {matched?.on_sale || (!matched && product.on_sale) ? (
            <span className="absolute start-4 top-4 bg-lime px-2.5 py-1 text-xs font-bold uppercase text-navy-deep">
              {dict.products.onSale}
            </span>
          ) : null}
        </div>
        {gallery.length > 1 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {gallery.map((img) => {
              const active = (activeImageId ?? image?.id) === img.id;
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImageId(img.id)}
                  aria-label={img.alt || product.name}
                  aria-pressed={active}
                  className={`relative h-16 w-16 overflow-hidden bg-white transition ${
                    active
                      ? "ring-2 ring-navy ring-offset-1"
                      : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt || product.name}
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                  />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-navy sm:text-4xl">
          {product.name}
        </h1>

        <div className="mt-5 flex items-baseline gap-3">
          {regular ? (
            <span className="text-lg text-muted line-through">{regular}</span>
          ) : null}
          <span className="text-2xl font-bold text-navy">{priceLabel}</span>
        </div>

        <p className="mt-3 text-sm font-medium text-lime-deep">
          {isVariable && !matched
            ? dict.products.selectOptions
            : inStock
              ? dict.products.inStock
              : dict.products.outOfStock}
        </p>

        {attrs.length > 0 ? (
          <div className="mt-8 space-y-7">
            {attrs.map((attr) => {
              const asColor = isColorAttribute(attr.name, attr.taxonomy);
              const asSize =
                !asColor && isSizeAttribute(attr.name, attr.taxonomy);
              const current = selectedLabel(attr, selected);

              return (
                <div key={attr.name}>
                  <div className="mb-3 flex items-baseline gap-2">
                    <span className="text-sm font-semibold capitalize text-navy">
                      {attr.name}
                    </span>
                    {current ? (
                      <span className="text-sm capitalize text-muted">
                        — {current}
                      </span>
                    ) : (
                      <span className="text-sm text-muted">
                        — {dict.products.chooseOption}
                      </span>
                    )}
                  </div>

                  {asColor ? (
                    <div
                      className="flex flex-wrap gap-3"
                      role="listbox"
                      aria-label={attr.name}
                    >
                      {attr.terms.map((term) => {
                        const active = selected[attr.name] === term.slug;
                        const hex =
                          resolveSwatchColor(term.slug) ??
                          resolveSwatchColor(term.name);
                        return (
                          <button
                            key={`${attr.name}-${term.slug}`}
                            type="button"
                            role="option"
                            aria-selected={active}
                            title={term.name}
                            aria-label={term.name}
                            onClick={() => pick(attr.name, term.slug)}
                            className={`relative h-11 w-11 rounded-sm border-2 transition ${
                              active
                                ? "border-navy ring-2 ring-lime ring-offset-2 ring-offset-paper"
                                : "border-line hover:border-navy/50"
                            }`}
                            style={{
                              backgroundColor: hex ?? "#e8ebe3",
                            }}
                          >
                            {!hex ? (
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase text-navy">
                                {term.name.slice(0, 2)}
                              </span>
                            ) : null}
                            {active && hex ? (
                              <span
                                className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${
                                  isLightSwatch(hex)
                                    ? "text-navy"
                                    : "text-white"
                                }`}
                              >
                                ✓
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      className="flex flex-wrap gap-2.5"
                      role="listbox"
                      aria-label={attr.name}
                    >
                      {attr.terms.map((term) => {
                        const active = selected[attr.name] === term.slug;
                        return (
                          <button
                            key={`${attr.name}-${term.slug}`}
                            type="button"
                            role="option"
                            aria-selected={active}
                            onClick={() => pick(attr.name, term.slug)}
                            className={`inline-flex min-h-11 min-w-11 items-center justify-center border px-4 text-sm font-semibold uppercase tracking-wide transition ${
                              asSize ? "min-w-14" : ""
                            } ${
                              active
                                ? "border-navy bg-navy text-white"
                                : "border-line bg-white text-navy hover:border-navy"
                            }`}
                          >
                            {term.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 text-sm font-medium text-[#b42318]" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-stretch border border-line bg-white">
            <button
              type="button"
              aria-label="−"
              disabled={!canAdd || pending || qty <= 1}
              onClick={() => setQty((v) => clamp(v - 1))}
              className="inline-flex min-h-12 w-11 items-center justify-center text-lg font-bold text-navy transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={max}
              value={qty}
              aria-label={dict.cart.quantity}
              disabled={!canAdd || pending}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next)) setQty(clamp(next));
              }}
              className="w-14 border-x border-line bg-paper text-center text-base font-bold text-navy outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              aria-label="+"
              disabled={!canAdd || pending || qty >= max}
              onClick={() => setQty((v) => clamp(v + 1))}
              className="inline-flex min-h-12 w-11 items-center justify-center text-lg font-bold text-navy transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </div>

          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (isVariable && !matched) {
                setError(dict.products.selectVariation);
                return;
              }
              if (!canAdd) return;
              startTransition(async () => {
                const result = await addItem(addId, qty);
                if (result.ok) {
                  setDone(true);
                  window.setTimeout(() => setDone(false), 1600);
                } else {
                  setError(result.message || dict.error);
                }
              });
            }}
            className="inline-flex min-h-12 items-center justify-center bg-lime px-6 text-sm font-bold uppercase tracking-wide text-navy-deep transition hover:bg-lime-deep hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin text-navy-deep"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
            ) : isVariable && !matched ? (
              dict.products.selectOptions
            ) : !canAdd ? (
              dict.products.outOfStock
            ) : (
              dict.products.addToCart
            )}
          </button>

          <WishlistButton
            dict={dict}
            item={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              image: image?.src,
              price: priceLabel,
            }}
          />
        </div>
      </div>
    </div>
  );
}
