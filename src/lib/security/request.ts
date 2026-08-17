import { getWpUrl } from "@/lib/woocommerce/store";

/**
 * Reject cross-site mutating requests. Allows missing Origin (same-origin
 * navigations / some browsers) only when Referer is same-origin or absent.
 */
export function assertSameOrigin(request: Request): Response | null {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const expected = new URL(request.url).origin;

  if (origin) {
    if (origin !== expected) {
      return Response.json({ message: "Forbidden origin." }, { status: 403 });
    }
    return null;
  }

  if (referer) {
    try {
      if (new URL(referer).origin !== expected) {
        return Response.json({ message: "Forbidden origin." }, { status: 403 });
      }
    } catch {
      return Response.json({ message: "Forbidden origin." }, { status: 403 });
    }
  }

  return null;
}

/** Allow only https payment redirects to WP host or known PSP hosts. */
export function isAllowedPaymentRedirect(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:") return false;

  const wpHost = (() => {
    try {
      return new URL(getWpUrl()).hostname.toLowerCase();
    } catch {
      return "";
    }
  })();

  const host = parsed.hostname.toLowerCase();
  const allowedExact = new Set(
    [
      wpHost,
      "accept.paymob.com",
      "egypt.paymob.com",
      "checkout.paymob.com",
      "fawry.com",
      "atfawry.com",
      "checkout.stripe.com",
      "pay.stripe.com",
    ].filter(Boolean),
  );

  if (allowedExact.has(host)) return true;

  // Subdomains of trusted PSPs
  const allowedSuffixes = [
    ".paymob.com",
    ".stripe.com",
    ".fawry.com",
    ".atfawry.com",
  ];
  return allowedSuffixes.some((suffix) => host.endsWith(suffix));
}
