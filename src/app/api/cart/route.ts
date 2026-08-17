import { NextResponse } from "next/server";
import {
  addToCart,
  applyCoupon,
  getCart,
  removeCartItem,
  removeCoupon,
  selectShippingRate,
  updateCartItem,
  updateCustomer,
} from "@/lib/woocommerce/cart";
import { assertSameOrigin } from "@/lib/security/request";
import { assertRateLimit } from "@/lib/security/rate-limit";

const ALLOWED_ACTIONS = new Set([
  "add",
  "update",
  "remove",
  "apply_coupon",
  "remove_coupon",
  "update_customer",
  "select_shipping",
]);

const ADDRESS_KEYS = new Set([
  "first_name",
  "last_name",
  "company",
  "address_1",
  "address_2",
  "city",
  "state",
  "postcode",
  "country",
  "email",
  "phone",
]);

function pickAddress(
  input?: Record<string, string>,
): Record<string, string> | undefined {
  if (!input) return undefined;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!ADDRESS_KEYS.has(key)) continue;
    if (typeof value !== "string") continue;
    out[key] = value.trim().slice(0, 200);
  }
  return Object.keys(out).length ? out : undefined;
}

function clientError(error: unknown): string {
  if (error instanceof Error && error.message.length < 200) {
    // Prefer short WC messages; drop HTML blobs
    if (!error.message.includes("<") && !error.message.includes("{")) {
      return error.message;
    }
  }
  return "Cart error. Please try again.";
}

export async function GET() {
  try {
    const cart = await getCart();
    return NextResponse.json(cart);
  } catch (error) {
    console.error("[cart GET]", error);
    return NextResponse.json({ message: "Cart error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const forbidden = assertSameOrigin(request);
  if (forbidden) return forbidden;

  const rateLimited = assertRateLimit(request, "cart_mutation", 45, 60 * 1000);
  if (rateLimited) return rateLimited;

  try {
    const body = (await request.json()) as {
      action?: string;
      productId?: number;
      key?: string;
      quantity?: number;
      code?: string;
      rateId?: string;
      packageId?: number | string;
      billing_address?: Record<string, string>;
      shipping_address?: Record<string, string>;
    };

    if (!body.action || !ALLOWED_ACTIONS.has(body.action)) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    if (body.action === "add") {
      const productId = Number(body.productId);
      const quantity = Number(body.quantity ?? 1);
      if (!Number.isInteger(productId) || productId <= 0) {
        return NextResponse.json({ message: "Invalid product" }, { status: 400 });
      }
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
        return NextResponse.json(
          { message: "Invalid quantity" },
          { status: 400 },
        );
      }
      const cart = await addToCart(productId, quantity);
      return NextResponse.json(cart);
    }

    if (body.action === "update" && body.key) {
      const quantity = Number(body.quantity);
      if (!Number.isInteger(quantity) || quantity < 0 || quantity > 999) {
        return NextResponse.json(
          { message: "Invalid quantity" },
          { status: 400 },
        );
      }
      const key = String(body.key).slice(0, 120);
      const cart = await updateCartItem(key, quantity);
      return NextResponse.json(cart);
    }

    if (body.action === "remove" && body.key) {
      const cart = await removeCartItem(String(body.key).slice(0, 120));
      return NextResponse.json(cart);
    }

    if (body.action === "apply_coupon" && body.code) {
      const couponRateLimited = assertRateLimit(request, "apply_coupon", 6, 60 * 1000);
      if (couponRateLimited) return couponRateLimited;

      const code = body.code.trim().slice(0, 64);
      if (!code) {
        return NextResponse.json({ message: "Invalid coupon" }, { status: 400 });
      }
      const cart = await applyCoupon(code);
      return NextResponse.json(cart);
    }

    if (body.action === "remove_coupon" && body.code) {
      const cart = await removeCoupon(body.code.trim().slice(0, 64));
      return NextResponse.json(cart);
    }

    if (body.action === "update_customer") {
      const cart = await updateCustomer({
        billing_address: pickAddress(body.billing_address),
        shipping_address: pickAddress(body.shipping_address),
      });
      return NextResponse.json(cart);
    }

    if (body.action === "select_shipping" && body.rateId) {
      const rateId = String(body.rateId).slice(0, 120);
      const cart = await selectShippingRate(rateId, body.packageId);
      return NextResponse.json(cart);
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[cart POST]", error);
    return NextResponse.json({ message: clientError(error) }, { status: 500 });
  }
}
