import type { WooCartItem } from "./types";

/** Human-readable variation lines for cart / checkout (Color: Blue). */
export function cartItemVariationLines(item: WooCartItem): string[] {
  const fromVariation = (item.variation ?? [])
    .filter((v) => v.attribute && v.value)
    .map((v) => `${v.attribute}: ${v.value}`);

  if (fromVariation.length) return fromVariation;

  return (item.item_data ?? [])
    .filter((d) => d.name && (d.display || d.value))
    .map((d) => `${d.name}: ${d.display || d.value}`);
}
