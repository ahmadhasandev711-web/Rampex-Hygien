import { AboutTeaser } from "@/components/home/AboutTeaser";
import { Hero } from "@/components/home/Hero";
import { ProductSection } from "@/components/home/ProductSection";
import { TrustBar } from "@/components/home/TrustBar";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { localeAlternates } from "@/lib/seo";
import { fetchProducts } from "@/lib/woocommerce/store";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = getDictionary(raw);
  return {
    title: dict.brand,
    description: dict.hero.subtitle,
    alternates: localeAlternates(raw),
    openGraph: {
      title: dict.brand,
      description: dict.hero.subtitle,
      locale: raw === "ar" ? "ar_EG" : "en_US",
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);

  const [newest, popular, offers] = await Promise.all([
    fetchProducts({ perPage: 8, orderby: "date", order: "desc" }),
    fetchProducts({ perPage: 4, orderby: "popularity", order: "desc" }),
    fetchProducts({ perPage: 4, onSale: true }),
  ]);

  return (
    <>
      <Hero locale={locale} dict={dict} />
      <TrustBar dict={dict} />
      <ProductSection
        title={dict.sections.newArrivals}
        subtitle={dict.sections.newArrivalsSub}
        products={newest}
        locale={locale}
        dict={dict}
        viewAllHref={`/${locale}/products`}
        priorityCount={4}
      />
      <AboutTeaser locale={locale} dict={dict} />
      <div className="texture-dots">
        <ProductSection
          title={dict.sections.popular}
          subtitle={dict.sections.popularSub}
          products={popular}
          locale={locale}
          dict={dict}
          viewAllHref={`/${locale}/products`}
        />
      </div>
      <ProductSection
        title={dict.sections.offers}
        subtitle={dict.sections.offersSub}
        products={offers}
        locale={locale}
        dict={dict}
        viewAllHref={`/${locale}/products?sale=1`}
      />
    </>
  );
}
