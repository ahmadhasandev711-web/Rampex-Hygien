"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useTransition } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

type ProductToolbarProps = {
  locale: Locale;
  dict: Dictionary;
};

export function ProductToolbar({ locale, dict }: ProductToolbarProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const search = params.get("q") ?? "";
  const onSale = params.get("sale") === "1";
  const sort = params.get("sort") ?? "name";

  function push(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value) sp.delete(key);
      else sp.set(key, value);
    }
    startTransition(() => {
      router.push(`/${locale}/products?${sp.toString()}`);
    });
  }

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    startTransition(() => {
      if (q) {
        router.push(`/${locale}/search?q=${encodeURIComponent(q)}`);
        return;
      }
      // Keep sale/sort filters on the catalog when clearing search
      const sp = new URLSearchParams(params.toString());
      sp.delete("q");
      const qs = sp.toString();
      router.push(`/${locale}/products${qs ? `?${qs}` : ""}`);
    });
  }

  return (
    <div className="mb-8 flex flex-col gap-4 border border-line bg-white p-4 sm:flex-row sm:items-end sm:justify-between">
      <form onSubmit={onSearch} className="flex w-full max-w-md gap-2">
        <label className="sr-only" htmlFor="product-search">
          {dict.products.search}
        </label>
        <input
          id="product-search"
          name="q"
          defaultValue={search}
          placeholder={dict.products.searchPlaceholder}
          className="w-full border border-line bg-paper px-3 py-2.5 text-navy outline-none focus:border-navy"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-navy px-4 text-sm font-semibold text-white"
        >
          {dict.products.search}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => push({ sale: onSale ? null : "1" })}
          className={`px-3 py-2 text-sm font-semibold ${
            onSale
              ? "bg-lime text-navy-deep"
              : "border border-line text-navy"
          }`}
        >
          {onSale ? dict.products.filterAll : dict.products.filterSale}
        </button>
        <select
          value={sort}
          onChange={(e) => push({ sort: e.target.value })}
          className="border border-line bg-paper px-3 py-2 text-sm text-navy"
          aria-label={dict.products.sort}
        >
          <option value="name">{dict.products.sortName}</option>
          <option value="newest">{dict.products.sortNewest}</option>
          <option value="price-asc">{dict.products.sortPriceAsc}</option>
          <option value="price-desc">{dict.products.sortPriceDesc}</option>
        </select>
      </div>
    </div>
  );
}
