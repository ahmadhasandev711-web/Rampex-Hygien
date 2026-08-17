import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

type NotFoundViewProps = {
  locale: Locale;
  dict: Dictionary;
  /** When true, fills the viewport (root fallback without Header/Footer). */
  fullPage?: boolean;
};

export function NotFoundView({
  locale,
  dict,
  fullPage = false,
}: NotFoundViewProps) {
  const copy = dict.notFoundPage;

  return (
    <section
      className={
        fullPage
          ? "surface-grid flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6"
          : "mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28"
      }
    >
      <div className={fullPage ? "mx-auto max-w-xl text-center" : "max-w-xl"}>
        <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.28em] text-lime-deep">
          {dict.brand}
        </p>
        <p className="animate-fade-up delay-1 mt-6 font-[family-name:var(--font-display)] text-7xl font-bold tracking-tight text-navy sm:text-8xl">
          {copy.code}
        </p>
        <h1 className="animate-fade-up delay-2 mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
          {copy.title}
        </h1>
        <p className="animate-fade-up delay-3 mt-4 text-base leading-relaxed text-muted sm:text-lg">
          {copy.body}
        </p>
        <div className="animate-fade-up delay-3 mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/${locale}`}
            className="inline-flex min-h-12 items-center bg-lime px-6 text-sm font-bold uppercase tracking-wide text-navy-deep transition hover:bg-lime-deep hover:text-white"
          >
            {copy.home}
          </Link>
          <Link
            href={`/${locale}/products`}
            className="inline-flex min-h-12 items-center border border-navy/25 px-6 text-sm font-bold uppercase tracking-wide text-navy transition hover:border-navy hover:bg-navy hover:text-white"
          >
            {copy.shop}
          </Link>
        </div>
      </div>
    </section>
  );
}
