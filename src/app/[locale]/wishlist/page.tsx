import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WishlistClient } from "@/components/products/WishlistClient";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { noIndexRobots } from "@/lib/seo";

type WishlistPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: WishlistPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return {
    title: getDictionary(raw).wishlist.title,
    robots: noIndexRobots(),
  };
}

export default async function WishlistPage({ params }: WishlistPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      <h1 className="mb-10 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-navy">
        {dict.wishlist.title}
      </h1>
      <WishlistClient locale={locale} dict={dict} />
    </div>
  );
}
