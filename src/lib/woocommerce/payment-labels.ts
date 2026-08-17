/** Friendly labels for known WooCommerce payment gateway IDs. */
export function paymentMethodLabel(
  methodId: string,
  locale: "en" | "ar" = "en",
): string {
  const labels: Record<string, { en: string; ar: string }> = {
    cod: { en: "Cash on delivery", ar: "الدفع عند الاستلام" },
    bacs: { en: "Direct bank transfer", ar: "تحويل بنكي" },
    cheque: { en: "Check payments", ar: "شيك" },
    paypal: { en: "PayPal", ar: "PayPal" },
    stripe: { en: "Card (Stripe)", ar: "بطاقة (Stripe)" },
    "woocommerce_payments": { en: "Card", ar: "بطاقة" },
    fawry: { en: "Fawry", ar: "فوري" },
    "fawry-pay": { en: "Fawry", ar: "فوري" },
    paymob: { en: "Card / Wallet (Paymob)", ar: "بطاقة / محفظة (Paymob)" },
    "paymob_gateway": { en: "Card / Wallet (Paymob)", ar: "بطاقة / محفظة (Paymob)" },
  };

  const known = labels[methodId.toLowerCase()];
  if (known) return known[locale];
  return methodId.replace(/_/g, " ");
}

export function paymentMethodHelp(
  methodId: string,
  locale: "en" | "ar" = "en",
): string {
  const id = methodId.toLowerCase();
  if (id === "cod") {
    return locale === "ar"
      ? "ادفع نقدًا عند استلام الطلب."
      : "Pay with cash upon delivery.";
  }
  if (id.includes("fawry")) {
    return locale === "ar"
      ? "سيتم توجيهك لإتمام الدفع عبر فوري إن لزم."
      : "You may be redirected to complete payment with Fawry.";
  }
  if (id.includes("stripe") || id.includes("paymob") || id.includes("card")) {
    return locale === "ar"
      ? "قد يتم تحويلك لصفحة الدفع الآمنة."
      : "You may be redirected to a secure payment page.";
  }
  return locale === "ar"
    ? "طريقة دفع مفعّلة من المتجر."
    : "Payment method enabled on the store.";
}

export function flattenShippingRates(
  packages: { package_id: number | string; shipping_rates: { rate_id: string; name: string; price: string; selected: boolean; description?: string; currency_minor_unit?: number; currency_symbol?: string; currency_code?: string; currency_prefix?: string; currency_suffix?: string; currency_decimal_separator?: string; currency_thousand_separator?: string }[] }[] | undefined,
) {
  if (!packages?.length) return [];
  return packages.flatMap((pkg) =>
    (pkg.shipping_rates ?? []).map((rate) => ({
      ...rate,
      package_id: pkg.package_id,
    })),
  );
}
