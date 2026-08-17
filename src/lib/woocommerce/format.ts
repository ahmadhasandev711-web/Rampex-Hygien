import type { WooCurrency } from "./types";

export function formatWooPrice(
  amount: string | number,
  currency: Pick<
    WooCurrency,
    | "currency_minor_unit"
    | "currency_prefix"
    | "currency_suffix"
    | "currency_code"
  >,
): string {
  const minor = currency.currency_minor_unit ?? 2;
  const value =
    typeof amount === "string" ? Number.parseInt(amount, 10) : amount;
  const major = Number.isFinite(value) ? value / 10 ** minor : 0;

  const formatted = major.toLocaleString("en-EG", {
    minimumFractionDigits: minor,
    maximumFractionDigits: minor,
  });

  const prefix = currency.currency_prefix || currency.currency_code || "";
  const suffix = currency.currency_suffix || "";

  return `${prefix}${formatted}${suffix}`.trim();
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
