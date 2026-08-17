import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/config";
import { localeAlternates } from "@/lib/seo";

const WP =
  "https://ivory-armadillo-568207.hostingersite.com/wp-content/uploads/2026/07";

const IMAGES = {
  founder: `${WP}/photo-3-e1684757211594.jpg`,
} as const;

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = getDictionary(raw);
  return {
    title: dict.about.title,
    description: dict.about.lead,
    alternates: localeAlternates(raw, "/about"),
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);

  return (
    <div className="bg-paper text-navy">
      {/* Quiet hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-deep">
          {dict.brand}
        </p>
        <h1 className="mt-5 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.1] tracking-tight text-navy sm:text-5xl md:text-6xl">
          {dict.about.title}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          {dict.about.heroLine}
        </p>
      </section>

      {/* Story — calm reading */}
      <section className="border-y border-line/80 bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-lime-deep">
              {dict.about.eyebrow}
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
              {dict.about.storyTitle}
            </h2>
          </div>
          <div className="space-y-6 lg:col-span-8">
            <p className="text-xl font-medium leading-relaxed text-navy sm:text-2xl sm:leading-relaxed">
              {dict.about.lead}
            </p>
            <p className="max-w-2xl text-base leading-relaxed text-muted">
              {dict.about.body}
            </p>
            <p className="pt-2 text-sm text-navy/70">{dict.about.audience}</p>
          </div>
        </div>
      </section>

      {/* Founder — clear photo, soft panel, no heavy wash */}
      <section id="founder" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="relative aspect-[4/5] overflow-hidden bg-white sm:aspect-[3/4]">
            <Image
              src={IMAGES.founder}
              alt={dict.about.founderName}
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          <div className="flex flex-col justify-center py-2 lg:py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-lime-deep">
              {dict.about.founderLabel}
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
              {dict.about.founderName}
            </h2>
            <p className="mt-2 text-sm tracking-wide text-muted">
              {dict.about.founderRole}
            </p>
            <blockquote className="mt-8 border-s-2 border-lime ps-5 text-lg leading-relaxed text-navy/85 sm:text-xl sm:leading-relaxed">
              “{dict.about.founderQuote}”
            </blockquote>
          </div>
        </div>
      </section>

      {/* Soft product + CTA — image keeps its own light ground; no extra frame */}
      <section className="border-t border-line/80 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src="/brand/product-collage.png"
              alt=""
              fill
              unoptimized
              priority
              loading="eager"
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
              {dict.about.shopTitle}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
              {dict.about.shopBody}
            </p>
            <Link
              href={`/${locale}/products`}
              className="mt-8 inline-flex min-h-12 items-center bg-navy px-7 text-sm font-semibold tracking-wide text-white transition hover:bg-navy-soft"
            >
              {dict.about.shopCta}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
