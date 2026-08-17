import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

/** Full-bleed hospitality atmosphere — more striking than a quiet paper hero. */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=2000&q=80";

type HeroProps = {
  locale: Locale;
  dict: Dictionary;
};

export function Hero({ locale, dict }: HeroProps) {
  return (
    <section className="relative min-h-[88vh] overflow-hidden bg-navy-deep text-white">
      <Image
        src={HERO_IMAGE}
        alt=""
        fill
        priority
        loading="eager"
        className="animate-drift object-cover opacity-45"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/85 to-navy/35" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-deep/90 to-transparent" />

      <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20">
        <p className="animate-fade-up mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-lime">
          {dict.brand}
        </p>
        <h1 className="animate-fade-up delay-1 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          {dict.hero.title}
        </h1>
        <p className="animate-fade-up delay-2 mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
          {dict.hero.subtitle}
        </p>
        <div className="animate-fade-up delay-3 mt-8 flex flex-wrap gap-3">
          <Link
            href={`/${locale}/products`}
            className="inline-flex min-h-12 items-center bg-lime px-6 text-sm font-bold uppercase tracking-wide text-navy-deep transition hover:bg-white"
          >
            {dict.hero.cta}
          </Link>
          <Link
            href={`/${locale}/about`}
            className="inline-flex min-h-12 items-center border border-white/40 px-6 text-sm font-bold uppercase tracking-wide text-white transition hover:border-white hover:bg-white/10"
          >
            {dict.hero.secondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
