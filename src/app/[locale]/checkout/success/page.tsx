import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { noIndexRobots } from "@/lib/seo";

type SuccessPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string; email?: string }>;
};

export async function generateMetadata({
  params,
}: SuccessPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = getDictionary(raw);
  return {
    title: dict.checkout.successTitle,
    robots: noIndexRobots(),
  };
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const { order, email } = await searchParams;
  const trackHref =
    order && email
      ? `/${locale}/track?order=${encodeURIComponent(order)}&email=${encodeURIComponent(email)}`
      : `/${locale}/track${order ? `?order=${encodeURIComponent(order)}` : ""}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-lime text-2xl font-bold text-navy-deep">
        ✓
      </div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-navy sm:text-4xl">
        {dict.checkout.successTitle}
      </h1>
      <p className="mt-4 text-muted">{dict.checkout.successBody}</p>
      {order ? (
        <p className="mt-6 text-lg font-semibold text-navy">
          {dict.checkout.orderNumber}: #{order}
        </p>
      ) : null}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={trackHref}
          className="inline-flex min-h-12 items-center bg-navy px-6 text-sm font-bold uppercase tracking-wide text-white"
        >
          {dict.checkout.trackOrder}
        </Link>
        <Link
          href={`/${locale}/products`}
          className="inline-flex min-h-12 items-center border border-navy px-6 text-sm font-bold uppercase tracking-wide text-navy"
        >
          {dict.checkout.continueShopping}
        </Link>
      </div>
    </div>
  );
}
