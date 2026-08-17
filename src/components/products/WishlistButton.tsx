"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  isInWishlist,
  toggleWishlistItem,
  type WishlistItem,
} from "@/lib/storage/wishlist";

type WishlistButtonProps = {
  item: WishlistItem;
  dict: Dictionary;
  className?: string;
};

export function WishlistButton({ item, dict, className }: WishlistButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isInWishlist(item.id));
  }, [item.id]);

  return (
    <button
      type="button"
      className={
        className ??
        "inline-flex min-h-11 items-center border border-navy px-4 text-sm font-semibold text-navy transition hover:bg-paper"
      }
      onClick={() => {
        const next = toggleWishlistItem(item);
        setSaved(next.some((x) => x.id === item.id));
      }}
      aria-pressed={saved}
    >
      {saved ? dict.wishlist.saved : dict.wishlist.add}
    </button>
  );
}
