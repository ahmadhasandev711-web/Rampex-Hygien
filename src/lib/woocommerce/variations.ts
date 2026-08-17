import type { WooProduct, WooProductAttribute } from "./types";

export function variationAttributes(
  product: WooProduct,
): WooProductAttribute[] {
  const list = (product.attributes ?? []).filter(
    (a) => Array.isArray(a.terms) && a.terms.length > 0,
  );

  const flagged = list.filter((a) => a.has_variations);
  if (flagged.length) return flagged;

  // Custom attributes sometimes omit has_variations in edge cases
  if (product.type === "variable" || product.has_options) {
    return list;
  }

  return [];
}

export function findMatchingVariation(
  product: WooProduct,
  variations: WooProduct[],
  selected: Record<string, string>,
): WooProduct | null {
  const attrs = variationAttributes(product);
  if (!attrs.length) return null;

  const complete = attrs.every((a) => Boolean(selected[a.name]));
  if (!complete) return null;

  const refs = product.variations ?? [];

  for (const variation of variations) {
    const ref = refs.find((r) => r.id === variation.id);
    if (!ref) continue;

    const match = attrs.every((attr) => {
      const wanted = selected[attr.name]?.toLowerCase();
      const found = ref.attributes.find(
        (a) => a.name.toLowerCase() === attr.name.toLowerCase(),
      );
      if (!found) return false;
      const value = found.value.toLowerCase();
      // Match slug or display name (custom attrs often use "Black" as both)
      const term = attr.terms.find(
        (t) =>
          t.slug.toLowerCase() === wanted || t.name.toLowerCase() === wanted,
      );
      return (
        value === wanted ||
        (term != null &&
          (value === term.slug.toLowerCase() ||
            value === term.name.toLowerCase()))
      );
    });

    if (match) return variation;
  }

  // Fallback: match using parent variation refs only (if variation detail fetch failed)
  for (const ref of refs) {
    const match = attrs.every((attr) => {
      const wanted = selected[attr.name]?.toLowerCase();
      const found = ref.attributes.find(
        (a) => a.name.toLowerCase() === attr.name.toLowerCase(),
      );
      return found && found.value.toLowerCase() === wanted;
    });
    if (match) {
      const full = variations.find((v) => v.id === ref.id);
      if (full) return full;
    }
  }

  return null;
}

export function formatProductPriceLabel(
  product: WooProduct,
  format: (amount: string, currency: WooProduct["prices"]) => string,
  fromLabel?: string,
): string {
  const range = product.prices.price_range;
  if (
    range &&
    range.min_amount !== range.max_amount &&
    (product.type === "variable" || product.has_options)
  ) {
    const min = format(range.min_amount, product.prices);
    const max = format(range.max_amount, product.prices);
    return fromLabel ? `${fromLabel} ${min}` : `${min} – ${max}`;
  }
  return format(product.prices.price, product.prices);
}
