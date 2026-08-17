import type { WooCart, WooProduct } from "./types";

const WP_URL =
  process.env.NEXT_PUBLIC_WP_URL ??
  "https://ivory-armadillo-568207.hostingersite.com";

const STORE_API = `${WP_URL}/wp-json/wc/store/v1`;

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

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, init);
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
    throw new Error(`Failed to fetch products: ${res.status}`);
  }

  return res.json() as Promise<WooProduct[]>;
}

export async function fetchProductBySlug(
  slug: string,
): Promise<WooProduct | null> {
  // Prefer the single-product path — clearer 404 vs error than ?slug= lists.
  const res = await fetchWithRetry(
    `${STORE_API}/products/${encodeURIComponent(slug)}`,
    { next: { revalidate: 30 } },
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to fetch product "${slug}": ${res.status}`);
  }

  const product = (await res.json()) as WooProduct;

  // Store API may resolve a variation that shares the parent slug —
  // always load the variable parent so attributes/options are available.
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

export async function fetchProductById(
  id: number,
): Promise<WooProduct | null> {
  const res = await fetchWithRetry(`${STORE_API}/products/${id}`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) return null;
  return res.json() as Promise<WooProduct>;
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
      results[current] = await fn(items[current]);
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
  const ids = product.variations?.map((v) => v.id) ?? [];
  if (!ids.length) return [];

  // Limit parallel requests to max 4 concurrent requests to prevent WP PHP process exhaustion
  const results = await mapConcurrent(ids, 4, (id) => fetchProductById(id));
  return results.filter((v): v is WooProduct => v != null);
}

export async function fetchRelatedProducts(
  productId: number,
  perPage = 4,
): Promise<WooProduct[]> {
  const params = new URLSearchParams({
    related: String(productId),
    per_page: String(perPage),
  });

  const res = await fetchWithRetry(`${STORE_API}/products?${params}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return [];
  return res.json() as Promise<WooProduct[]>;
}

export function getStoreApiBase() {
  return STORE_API;
}

export function getWpUrl() {
  return WP_URL;
}

export type { WooCart, WooProduct };
