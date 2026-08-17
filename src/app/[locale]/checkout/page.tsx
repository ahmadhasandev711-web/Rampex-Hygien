import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { noIndexRobots } from "@/lib/seo";

type CheckoutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: CheckoutPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = getDictionary(raw);
  return {
    title: dict.checkout.title,
    robots: noIndexRobots(),
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="mb-10 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-navy sm:text-4xl">
        {dict.checkout.title}
      </h1>
      <CheckoutForm locale={locale} dict={dict} />
    </div>
  );
}
