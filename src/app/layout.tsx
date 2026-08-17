import type { Metadata } from "next";
import { headers } from "next/headers";
import { Cairo, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-body",
  subsets: ["latin", "arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://rampexhygiene.com",
  ),
  title: {
    default: "Rampex Hygiene",
    template: "%s | Rampex Hygiene",
  },
  description:
    "Premium paper tissue products for hotels, hospitals, resorts, restaurants, and cafés.",
  icons: {
    icon: "/brand/logo-mark.png",
    apple: "/brand/logo-mark.png",
  },
  openGraph: {
    type: "website",
    siteName: "Rampex Hygiene",
    title: "Rampex Hygiene",
    description:
      "Specialized paper tissue solutions for hospitality and healthcare in Egypt.",
    images: [{ url: "/brand/logo-mark.png" }],
  },
  twitter: {
    card: "summary",
    title: "Rampex Hygiene",
    description:
      "Specialized paper tissue solutions for hospitality and healthcare in Egypt.",
    images: ["/brand/logo-mark.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const locale = h.get("x-locale") ?? "en";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      data-scroll-behavior="smooth"
      className={`${outfit.variable} ${cairo.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
