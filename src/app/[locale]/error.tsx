"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LocaleError({ error, reset }: ErrorProps) {
  const params = useParams();
  const raw = String(params?.locale ?? "en");
  const locale: Locale = isLocale(raw) ? raw : "en";
  const dict = getDictionary(locale);

  useEffect(() => {
    console.error("[locale error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-deep">
        {dict.brand}
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-navy">
        {dict.error}
      </h1>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-12 items-center bg-lime px-6 text-sm font-bold uppercase tracking-wide text-navy-deep"
        >
          {dict.tryAgain}
        </button>
        <Link
          href={`/${locale}`}
          className="inline-flex min-h-12 items-center border border-navy/25 px-6 text-sm font-bold uppercase tracking-wide text-navy"
        >
          {dict.notFoundPage.home}
        </Link>
      </div>
    </div>
  );
}
