import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/products/ProductDetailClient";
import { ProductGrid } from "@/components/products/ProductGrid";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { sanitizeProductHtml, stripHtml } from "@/lib/security/html";
import { localeAlternates } from "@/lib/seo";
import {
  fetchProductBySlug,
  fetchProductVariations,
  fetchRelatedProducts,
} from "@/lib/woocommerce/store";

type ProductPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

// Avoid sticky cached 404s when WooCommerce is briefly unreachable.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  try {
    const product = await fetchProductBySlug(slug);
    if (!product) return {};
    const description = stripHtml(product.short_description ?? "");
    const image = product.images?.[0]?.src;
    return {
      title: product.name,
      description,
      alternates: localeAlternates(raw, `/products/${slug}`),
      openGraph: {
        title: product.name,
        description,
        type: "website",
        locale: raw === "ar" ? "ar_EG" : "en_US",
        images: image ? [{ url: image }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return {};
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);

  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const [related, variations] = await Promise.all([
    fetchRelatedProducts(product.id, 4),
    fetchProductVariations(product),
  ]);

  const safeHtml = sanitizeProductHtml(
    product.description || product.short_description || "",
  );

  const minor = product.prices?.currency_minor_unit ?? 2;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: stripHtml(
      product.short_description || product.description || "",
    ),
    image: product.images?.map((img) => img.src).filter(Boolean),
    offers: {
      "@type": "Offer",
      priceCurrency: product.prices?.currency_code ?? "EGP",
      price: (Number(product.prices?.price ?? 0) / Math.pow(10, minor)).toFixed(
        minor,
      ),
      availability: product.is_in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://rampexhygiene.com"}/${locale}/products/${product.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={product}
        variations={variations}
        dict={dict}
      />

      <div className="prose-product mt-10 max-w-3xl text-sm leading-relaxed text-navy/85 lg:mt-14">
        <h2 className="text-lg font-bold text-navy">
          {dict.products.specifications}
        </h2>
        <div
          className="mt-3"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </div>

      {related.length > 0 ? (
        <section className="mt-20">
          <h2 className="mb-8 font-[family-name:var(--font-display)] text-2xl font-bold text-navy sm:text-3xl">
            {dict.products.related}
          </h2>
          <ProductGrid products={related} locale={locale} dict={dict} />
        </section>
      ) : null}
    </div>
  );
}
