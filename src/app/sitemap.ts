import type { MetadataRoute } from "next";
import { fetchProducts } from "@/lib/woocommerce/store";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ["en", "ar"] as const;
  const staticPaths = ["", "/products", "/about", "/contact", "/search"];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        changeFrequency:
          path === "" || path === "/products" ? "daily" : "weekly",
        priority: path === "" ? 1 : path === "/search" ? 0.3 : 0.7,
      });
    }
  }

  try {
    let page = 1;
    const perPage = 100;
    // Allow indexing all catalog products up to 10,000 items dynamically
    const maxPages = 100;
    while (page <= maxPages) {
      const products = await fetchProducts({
        perPage,
        page,
        orderby: "date",
      });
      if (!products.length) break;
      for (const product of products) {
        if (!product.slug) continue;
        for (const locale of locales) {
          entries.push({
            url: `${SITE_URL}/${locale}/products/${product.slug}`,
            changeFrequency: "weekly",
            priority: 0.6,
          });
        }
      }
      if (products.length < perPage) break;
      page += 1;
    }
  } catch {
    // Store may be unreachable at build time
  }

  return entries;
}
