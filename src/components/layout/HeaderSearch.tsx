"use client";

import { FormEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

type HeaderSearchProps = {
  locale: Locale;
  dict: Dictionary;
  /** Compact inline field for desktop header */
  variant: "inline" | "bar";
  autoFocus?: boolean;
  onSubmitted?: () => void;
};

export function HeaderSearch({
  locale,
  dict,
  variant,
  autoFocus = false,
  onSubmitted,
}: HeaderSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    const href = q
      ? `/${locale}/search?q=${encodeURIComponent(q)}`
      : `/${locale}/search`;
    router.push(href);
    onSubmitted?.();
  }

  if (variant === "inline") {
    return (
      <form
        onSubmit={onSubmit}
        role="search"
        className="hidden min-w-0 max-w-[220px] flex-1 xl:max-w-[260px] lg:flex"
      >
        <label className="sr-only" htmlFor="header-search-inline">
          {dict.nav.search}
        </label>
        <div className="flex w-full overflow-hidden border border-line bg-paper focus-within:border-navy">
          <input
            ref={inputRef}
            id="header-search-inline"
            name="q"
            type="search"
            placeholder={dict.searchPage.placeholder}
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-navy outline-none placeholder:text-muted"
            autoComplete="off"
          />
          <button
            type="submit"
            className="shrink-0 px-3 text-navy/70 transition hover:bg-lime-soft hover:text-navy"
            aria-label={dict.searchPage.submit}
          >
            <SearchIcon />
          </button>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className="flex w-full gap-2 px-4 py-3 sm:px-6"
    >
      <label className="sr-only" htmlFor="header-search-bar">
        {dict.nav.search}
      </label>
      <input
        ref={inputRef}
        id="header-search-bar"
        name="q"
        type="search"
        placeholder={dict.searchPage.placeholder}
        className="min-w-0 flex-1 border border-line bg-paper px-3 py-2.5 text-sm text-navy outline-none focus:border-navy"
        autoComplete="off"
      />
      <button
        type="submit"
        className="shrink-0 bg-navy px-4 text-sm font-semibold text-white transition hover:bg-navy-soft"
      >
        {dict.searchPage.submit}
      </button>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 20l-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
