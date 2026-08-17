import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CartPageClient } from "@/components/cart/CartPageClient";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { noIndexRobots } from "@/lib/seo";

type CartPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: CartPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return {
    title: getDictionary(raw).cart.title,
    robots: noIndexRobots(),
  };
}

export default async function CartPage({ params }: CartPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  return <CartPageClient locale={locale} />;
}
