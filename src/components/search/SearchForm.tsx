"use client";

import { FormEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

type SearchFormProps = {
  locale: Locale;
  dict: Dictionary;
  defaultQuery?: string;
  autoFocus?: boolean;
  large?: boolean;
};

export function SearchForm({
  locale,
  dict,
  defaultQuery = "",
  autoFocus = false,
  large = false,
}: SearchFormProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    router.push(
      q
        ? `/${locale}/search?q=${encodeURIComponent(q)}`
        : `/${locale}/search`,
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className={`flex w-full gap-2 ${large ? "max-w-2xl" : "max-w-xl"}`}
    >
      <label className="sr-only" htmlFor="search-page-input">
        {dict.searchPage.title}
      </label>
      <input
        ref={inputRef}
        id="search-page-input"
        name="q"
        type="search"
        defaultValue={defaultQuery}
        placeholder={dict.searchPage.placeholder}
        className={`min-w-0 flex-1 border border-line bg-white text-navy outline-none focus:border-navy ${
          large ? "px-4 py-3.5 text-base" : "px-3 py-2.5 text-sm"
        }`}
        autoComplete="off"
      />
      <button
        type="submit"
        className={`shrink-0 bg-lime font-bold uppercase tracking-wide text-navy-deep transition hover:bg-lime-deep hover:text-white ${
          large ? "px-6 text-sm" : "px-4 text-sm"
        }`}
      >
        {dict.searchPage.submit}
      </button>
    </form>
  );
}
