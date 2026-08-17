import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/contact/ContactForm";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { CONTACT_EMAIL, CONTACT_PHONES } from "@/lib/contact";
import { localeAlternates } from "@/lib/seo";

const MAP_QUERY =
  "HYassa Building Mohamed ElDalal Maadi Cairo Egypt";
const MAP_EMBED = `https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&z=15&output=embed`;
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`;

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = getDictionary(raw);
  return {
    title: dict.contact.title,
    description: dict.contact.subtitle,
    alternates: localeAlternates(raw, "/contact"),
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = getDictionary(raw);

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-12 max-w-2xl">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-navy sm:text-5xl">
            {dict.contact.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {dict.contact.subtitle}
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-10">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-lime-deep">
                {dict.contact.phone}
              </h2>
              {CONTACT_PHONES.map((phone, index) => (
                <a
                  key={phone.tel}
                  href={`tel:${phone.tel}`}
                  className={`block text-lg font-semibold text-navy transition hover:text-navy-soft ${
                    index === 0 ? "mt-3" : "mt-1"
                  }`}
                  dir="ltr"
                >
                  {phone.display}
                </a>
              ))}
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-lime-deep">
                {dict.contact.address}
              </h2>
              <p className="mt-3 max-w-sm text-base leading-relaxed text-navy">
                {dict.contact.addressValue}
              </p>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-lime-deep">
                {dict.contact.emailLabel}
              </h2>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-3 block text-lg font-semibold text-navy transition hover:text-navy-soft"
              >
                {CONTACT_EMAIL}
              </a>
            </div>

            <p className="text-sm text-muted">{dict.contact.formNote}</p>
          </div>

          <ContactForm dict={dict} />
        </div>
      </div>

      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
                {dict.contact.mapTitle}
              </h2>
              <p className="mt-2 text-muted">{dict.contact.mapSubtitle}</p>
            </div>
            <a
              href={MAP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-navy underline decoration-lime decoration-2 underline-offset-4 transition hover:text-navy-soft"
            >
              {dict.contact.openMaps}
            </a>
          </div>
        </div>

        <div className="relative h-[380px] w-full overflow-hidden sm:h-[460px]">
          <iframe
            title={dict.contact.mapTitle}
            src={MAP_EMBED}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </section>
    </div>
  );
}
