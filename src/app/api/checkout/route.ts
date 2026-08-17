import { NextResponse } from "next/server";
import { getCart, placeOrder } from "@/lib/woocommerce/cart";
import { EGYPT_STATES } from "@/lib/woocommerce/egypt-states";
import type { CheckoutPayload } from "@/lib/woocommerce/types";
import {
  assertSameOrigin,
  isAllowedPaymentRedirect,
} from "@/lib/security/request";
import { assertRateLimit } from "@/lib/security/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EGYPT_STATE_CODES = new Set(EGYPT_STATES.map((s) => s.code));

export async function POST(request: Request) {
  const forbidden = assertSameOrigin(request);
  if (forbidden) return forbidden;

  const rateLimited = assertRateLimit(request, "checkout", 8, 60 * 1000);
  if (rateLimited) return rateLimited;

  try {
    const body = (await request.json()) as CheckoutPayload;
    const billing = body?.billing_address;

    if (
      !billing?.email ||
      !billing?.first_name ||
      !billing?.phone ||
      !billing?.address_1 ||
      !billing?.state ||
      !body?.payment_method
    ) {
      return NextResponse.json(
        { message: "Missing required checkout fields." },
        { status: 400 },
      );
    }

    if (!EMAIL_RE.test(billing.email.trim())) {
      return NextResponse.json(
        { message: "Invalid email address." },
        { status: 400 },
      );
    }

    if (!(EGYPT_STATE_CODES as Set<string>).has(billing.state)) {
      return NextResponse.json(
        { message: "Invalid governorate." },
        { status: 400 },
      );
    }

    // Fail closed: require an enabled method from this cart session
    const cart = await getCart();
    const allowed = cart.payment_methods ?? [];
    if (allowed.length === 0 || !allowed.includes(body.payment_method)) {
      return NextResponse.json(
        { message: "Selected payment method is not available." },
        { status: 400 },
      );
    }

    const order = await placeOrder({
      ...body,
      // Web route always attributes Website — ignore client spoofing
      origin: "website",
      customer_note: (body.customer_note ?? "").slice(0, 500),
      billing_address: {
        ...billing,
        email: billing.email.trim().slice(0, 120),
        first_name: billing.first_name.trim().slice(0, 80),
        last_name: (billing.last_name ?? "").trim().slice(0, 80),
        phone: billing.phone.trim().slice(0, 32),
        address_1: billing.address_1.trim().slice(0, 200),
        address_2: (billing.address_2 ?? "").trim().slice(0, 200),
        city: (billing.city ?? "").trim().slice(0, 80),
        postcode: (billing.postcode ?? "").trim().slice(0, 16),
        country: "EG",
        state: billing.state,
      },
    });

    const redirect = order.payment_result?.redirect_url;
    if (redirect && !isAllowedPaymentRedirect(redirect)) {
      // Keep order success path without sending buyer to an untrusted host
      return NextResponse.json({
        ...order,
        payment_result: {
          ...order.payment_result,
          redirect_url: "",
        },
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[checkout]", error);
    return NextResponse.json(
      { message: "Checkout failed. Please try again." },
      { status: 500 },
    );
  }
}
