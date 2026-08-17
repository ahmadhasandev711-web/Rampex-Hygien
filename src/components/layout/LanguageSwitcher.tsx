"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const nextLocale = locale === "en" ? "ar" : "en";
  const segments = pathname.split("/");
  segments[1] = nextLocale;
  const href = segments.join("/") || `/${nextLocale}`;

  return (
    <a
      href={href}
      className="rounded-md px-2.5 py-1.5 text-sm font-semibold tracking-wide text-navy transition hover:bg-lime-soft"
      hrefLang={nextLocale}
      lang={nextLocale}
    >
      {nextLocale === "ar" ? "العربية" : "EN"}
    </a>
  );
}
