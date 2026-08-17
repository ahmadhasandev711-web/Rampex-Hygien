import type { WooCart, WooProduct } from "./types";

const WP_URL =
  process.env.NEXT_PUBLIC_WP_URL ??
  "https://ivory-armadillo-568207.hostingersite.com";

const STORE_API = `${WP_URL}/wp-json/wc/store/v1`;

const DEFAULT_HEADERS = {
  "Accept": "application/json",
  "User-Agent":
    "Mozilla/5.0 (compatible; RampexHygieneStorefront/1.0; +https://rampexhygiene.com)",
};

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch wrapper with retry and exponential backoff for transient server/network errors.
 */
async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  retries = 2,
  backoffMs = 300,
): Promise<Response> {
  let lastError: unknown;

  const mergedInit: RequestInit = {
    ...init,
    headers: {
      ...DEFAULT_HEADERS,
      ...(init?.headers ?? {}),
    },
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, mergedInit);
      // If server error (502, 503, 504), retry
      if (res.status >= 500 && attempt < retries) {
        await sleep(backoffMs * Math.pow(2, attempt));
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await sleep(backoffMs * Math.pow(2, attempt));
        continue;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Network request failed for ${url}`);
}

type FetchProductsOptions = {
  perPage?: number;
  page?: number;
  orderby?: "date" | "popularity" | "price" | "title" | "rating";
  order?: "asc" | "desc";
  onSale?: boolean;
  search?: string;
  category?: string;
  include?: number[];
};

export async function fetchProducts(
  options: FetchProductsOptions = {},
): Promise<WooProduct[]> {
  try {
    const {
      perPage = 12,
      page = 1,
      orderby = "date",
      order = "desc",
      onSale,
      search,
      category,
      include,
    } = options;

    const params = new URLSearchParams({
      per_page: String(perPage),
      page: String(page),
      orderby,
      order,
    });

    if (onSale) params.set("on_sale", "true");
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (include && include.length > 0) {
      params.set("include", include.join(","));
    }

    const res = await fetchWithRetry(`${STORE_API}/products?${params}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return [];
    }

    return (await res.json()) as WooProduct[];
  } catch (error) {
    console.error("[fetchProducts]", error);
    return [];
  }
}

export async function fetchProductBySlug(
  slug: string,
): Promise<WooProduct | null> {
  try {
    // 1. Try single product endpoint by slug
    const directRes = await fetchWithRetry(
      `${STORE_API}/products/${encodeURIComponent(slug)}`,
      { next: { revalidate: 30 } },
    );

    if (directRes.ok) {
      const product = (await directRes.json()) as WooProduct;
      if (
        (product.type === "variation" || product.parent) &&
        product.parent &&
        product.parent > 0
      ) {
        const parent = await fetchProductById(product.parent);
        if (parent) return parent;
      }
      return product;
    }

    // 2. Fallback to query by slug (?slug=...)
    const queryRes = await fetchWithRetry(
      `${STORE_API}/products?slug=${encodeURIComponent(slug)}`,
      { next: { revalidate: 30 } },
    );

    if (queryRes.ok) {
      const list = (await queryRes.json()) as WooProduct[];
      if (Array.isArray(list) && list.length > 0 && list[0]) {
        const product = list[0];
        if (
          (product.type === "variation" || product.parent) &&
          product.parent &&
          product.parent > 0
        ) {
          const parent = await fetchProductById(product.parent);
          if (parent) return parent;
        }
        return product;
      }
    }

    return null;
  } catch (error) {
    console.error("[fetchProductBySlug]", error);
    return null;
  }
}

export async function fetchProductById(
  id: number,
): Promise<WooProduct | null> {
  try {
    const res = await fetchWithRetry(`${STORE_API}/products/${id}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return (await res.json()) as WooProduct;
  } catch {
    return null;
  }
}

/**
 * Concurrency helper to avoid flooding WordPress backend when loading multiple items.
 */
async function mapConcurrent<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index++;
      try {
        results[current] = await fn(items[current]);
      } catch {
        results[current] = null as R;
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

/** Load full variation products (prices, stock, images) for a variable parent safely. */
export async function fetchProductVariations(
  product: WooProduct,
): Promise<WooProduct[]> {
  try {
    const ids = product.variations?.map((v) => (typeof v === "object" ? v?.id : v)).filter(Boolean) as number[] ?? [];
    if (!ids.length) return [];

    const results = await mapConcurrent(ids, 4, (id) => fetchProductById(id));
    return results.filter((v): v is WooProduct => v != null);
  } catch {
    return [];
  }
}

export async function fetchRelatedProducts(
  productId: number,
  perPage = 4,
): Promise<WooProduct[]> {
  try {
    const params = new URLSearchParams({
      related: String(productId),
      per_page: String(perPage),
    });

    const res = await fetchWithRetry(`${STORE_API}/products?${params}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];
    return (await res.json()) as WooProduct[];
  } catch {
    return [];
  }
}

export function getStoreApiBase() {
  return STORE_API;
}

export function getWpUrl() {
  return WP_URL;
}

export type { WooCart, WooProduct };
