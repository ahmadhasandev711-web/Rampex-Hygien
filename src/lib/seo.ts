import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://rampexhygiene.com";

/** Build canonical + hreflang for a path without locale prefix ("" | "/products" | "/products/slug"). */
export function localeAlternates(
  locale: Locale,
  path = "",
): NonNullable<Metadata["alternates"]> {
  const suffix = !path || path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return {
    canonical: `${SITE_URL}/${locale}${suffix}`,
    languages: {
      en: `${SITE_URL}/en${suffix}`,
      ar: `${SITE_URL}/ar${suffix}`,
      "x-default": `${SITE_URL}/en${suffix}`,
    },
  };
}

export function noIndexRobots(): Metadata["robots"] {
  return { index: false, follow: false };
}
