import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80";

type AboutTeaserProps = {
  locale: Locale;
  dict: Dictionary;
};

export function AboutTeaser({ locale, dict }: AboutTeaserProps) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div className="absolute inset-0 opacity-30">
        <Image
          src={ABOUT_IMAGE}
          alt=""
          fill
          priority
          loading="eager"
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-navy/80" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-lime">
            {dict.brand}
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight sm:text-4xl">
            {dict.sections.aboutTitle}
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/80">
            {dict.sections.aboutBody}
          </p>
          <Link
            href={`/${locale}/about`}
            className="mt-8 inline-flex min-h-12 items-center bg-lime px-6 text-sm font-bold uppercase tracking-wide text-navy-deep transition hover:bg-white"
          >
            {dict.sections.aboutCta}
          </Link>
        </div>
        <div className="relative hidden aspect-[4/3] overflow-hidden lg:block">
          <Image
            src={ABOUT_IMAGE}
            alt={dict.brand}
            fill
            priority
            loading="eager"
            className="animate-drift object-cover"
            sizes="40vw"
          />
        </div>
      </div>
    </section>
  );
}
