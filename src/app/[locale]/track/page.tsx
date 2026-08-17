import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { TrackOrderClient } from "@/components/orders/TrackOrderClient";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { noIndexRobots } from "@/lib/seo";

type TrackPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string; email?: string }>;
};

export async function generateMetadata({
  params,
}: TrackPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = getDictionary(raw);
  return {
    title: dict.track.title,
    description: dict.track.subtitle,
    robots: noIndexRobots(),
  };
}

export default async function TrackPage({
  params,
  searchParams,
}: TrackPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const { order, email } = await searchParams;

  return (
    <Suspense fallback={<p className="p-10 text-center">{dict.loading}</p>}>
      <TrackOrderClient
        locale={locale}
        dict={dict}
        initialOrder={order}
        initialEmail={email}
      />
    </Suspense>
  );
}
