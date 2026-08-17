import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

type FooterProps = {
  locale: Locale;
  dict: Dictionary;
};

export function Footer({ locale, dict }: FooterProps) {
  const base = `/${locale}`;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="relative mb-5 h-14 w-[180px]">
            <Image
              src="/brand/logo-mark.png"
              alt={dict.brand}
              fill
              className="object-contain object-left"
              sizes="180px"
            />
          </div>
          <p className="max-w-md text-sm leading-relaxed text-white/75">
            {dict.footer.about}
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold tracking-wide text-lime">
            {dict.footer.shipping}
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <Link href={`${base}/products`} className="hover:text-white">
                {dict.nav.products}
              </Link>
            </li>
            <li>
              <Link href={`${base}/search`} className="hover:text-white">
                {dict.nav.search}
              </Link>
            </li>
            <li>
              <Link href={`${base}/track`} className="hover:text-white">
                {dict.nav.track}
              </Link>
            </li>
            <li>
              <Link href={`${base}/wishlist`} className="hover:text-white">
                {dict.nav.wishlist}
              </Link>
            </li>
            <li>
              <Link href={`${base}/about`} className="hover:text-white">
                {dict.nav.about}
              </Link>
            </li>
            <li>
              <Link href={`${base}/contact`} className="hover:text-white">
                {dict.nav.contact}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold tracking-wide text-lime">
            {dict.footer.contact}
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li dir="ltr">+20 27542375</li>
            <li dir="ltr">+20 25195345</li>
            <li className="leading-relaxed">{dict.contact.addressValue}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/55">
        © {year} {dict.brand}. {dict.footer.rights}
      </div>
    </footer>
  );
}
