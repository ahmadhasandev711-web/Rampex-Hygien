"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import {
  loadWishlist,
  removeWishlistItem,
  type WishlistItem,
} from "@/lib/storage/wishlist";

type WishlistClientProps = {
  locale: Locale;
  dict: Dictionary;
};

export function WishlistClient({ locale, dict }: WishlistClientProps) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    setItems(loadWishlist());
  }, []);

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted">{dict.wishlist.empty}</p>
        <Link
          href={`/${locale}/products`}
          className="mt-6 inline-flex min-h-12 items-center bg-navy px-6 text-sm font-bold uppercase tracking-wide text-white"
        >
          {dict.cart.continue}
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.id} className="border border-line bg-white p-4">
          <Link href={`/${locale}/products/${item.slug}`} className="block">
            <div className="relative mb-3 aspect-square bg-paper">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain p-3"
                  sizes="300px"
                />
              ) : null}
            </div>
            <h2 className="font-semibold text-navy">{item.name}</h2>
            {item.price ? (
              <p className="mt-1 text-sm font-bold text-navy">{item.price}</p>
            ) : null}
          </Link>
          <button
            type="button"
            className="mt-4 text-sm font-semibold text-muted underline"
            onClick={() => setItems(removeWishlistItem(item.id))}
          >
            {dict.wishlist.remove}
          </button>
        </li>
      ))}
    </ul>
  );
}
