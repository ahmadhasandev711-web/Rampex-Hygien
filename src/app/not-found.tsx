import { headers } from "next/headers";
import { NotFoundView } from "@/components/layout/NotFoundView";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export default async function RootNotFound() {
  const h = await headers();
  const raw = h.get("x-locale") ?? defaultLocale;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);

  return <NotFoundView locale={locale} dict={dict} fullPage />;
}
