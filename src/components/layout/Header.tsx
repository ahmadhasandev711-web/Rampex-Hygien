"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { useCart } from "@/components/cart/CartProvider";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

type HeaderProps = {
  locale: Locale;
  dict: Dictionary;
};

export function Header({ locale, dict }: HeaderProps) {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const base = `/${locale}`;

  const links = [
    { href: base, label: dict.nav.home },
    { href: `${base}/products`, label: dict.nav.products },
    { href: `${base}/about`, label: dict.nav.about },
    { href: `${base}/contact`, label: dict.nav.contact },
    { href: `${base}/track`, label: dict.nav.track },
    { href: `${base}/wishlist`, label: dict.nav.wishlist },
  ];

  useEffect(() => {
    if (!searchOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSearchOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-white/90 backdrop-blur-md">
      <div className="bg-navy text-center text-xs font-medium tracking-wide text-white sm:text-sm">
        <p className="px-4 py-2">{dict.promo}</p>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <Link
          href={base}
          className="relative block h-12 w-[140px] shrink-0 sm:h-14 sm:w-[190px]"
        >
          <Image
            src="/brand/logo-mark.png"
            alt={dict.brand}
            fill
            className="object-contain object-left"
            priority
            sizes="190px"
          />
        </Link>

        <nav className="hidden items-center gap-5 xl:gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-navy/80 transition hover:text-navy"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <HeaderSearch locale={locale} dict={dict} variant="inline" />

        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mobile / tablet: icon opens search bar under header */}
          <button
            type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-md border text-navy transition lg:hidden ${
              searchOpen
                ? "border-navy bg-lime-soft"
                : "border-line hover:bg-paper"
            }`}
            aria-label={dict.searchPage.openSearch}
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((v) => !v);
              setMenuOpen(false);
            }}
          >
            <SearchIcon />
          </button>

          <LanguageSwitcher locale={locale} />
          <Link
            href={`${base}/cart`}
            className="relative inline-flex items-center gap-2 rounded-md bg-navy px-3 py-2 text-sm font-semibold text-white transition hover:bg-navy-soft"
          >
            <span>{dict.nav.cart}</span>
            {count > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-lime px-1.5 text-xs font-bold text-navy-deep">
                {count}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line text-navy lg:hidden"
            aria-label={dict.menu}
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen((v) => !v);
              setSearchOpen(false);
            }}
          >
            <span className="sr-only">{dict.menu}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d={
                  menuOpen ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"
                }
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {searchOpen ? (
        <div className="border-t border-line bg-white lg:hidden">
          <div className="mx-auto max-w-6xl">
            <HeaderSearch
              locale={locale}
              dict={dict}
              variant="bar"
              autoFocus
              onSubmitted={() => setSearchOpen(false)}
            />
          </div>
        </div>
      ) : null}

      {menuOpen ? (
        <nav className="border-t border-line bg-white px-4 py-4 lg:hidden">
          <ul className="flex flex-col gap-3">
            <li>
              <Link
                href={`${base}/search`}
                className="block py-1 text-base font-semibold text-navy"
                onClick={() => setMenuOpen(false)}
              >
                {dict.nav.search}
              </Link>
            </li>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block py-1 text-base font-semibold text-navy"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
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
