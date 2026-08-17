const KEY = "rampex_wishlist";

export type WishlistItem = {
  id: number;
  slug: string;
  name: string;
  image?: string;
  price?: string;
};

export function loadWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WishlistItem[];
  } catch {
    return [];
  }
}

function persist(items: WishlistItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function isInWishlist(id: number) {
  return loadWishlist().some((item) => item.id === id);
}

export function toggleWishlistItem(item: WishlistItem): WishlistItem[] {
  const current = loadWishlist();
  const exists = current.some((x) => x.id === item.id);
  const next = exists
    ? current.filter((x) => x.id !== item.id)
    : [item, ...current];
  persist(next);
  return next;
}

export function removeWishlistItem(id: number): WishlistItem[] {
  const next = loadWishlist().filter((x) => x.id !== id);
  persist(next);
  return next;
}
