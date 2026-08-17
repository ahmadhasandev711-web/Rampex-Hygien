import { cookies } from "next/headers";
import { getStoreApiBase } from "@/lib/woocommerce/store";
import { buildOrderAttribution } from "@/lib/woocommerce/order-attribution";
import type {
  CheckoutPayload,
  CheckoutResult,
  WooCart,
} from "@/lib/woocommerce/types";

const CART_TOKEN = "wc_cart_token";
const CART_NONCE = "wc_store_nonce";

function buildHeaders(token?: string, nonce?: string): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Cart-Token"] = token;
  if (nonce) headers.Nonce = nonce;
  return headers;
}

async function persistSession(res: Response) {
  const cookieStore = await cookies();
  const token = res.headers.get("Cart-Token") ?? res.headers.get("cart-token");
  const nonce = res.headers.get("Nonce") ?? res.headers.get("nonce");

  if (token) {
    cookieStore.set(CART_TOKEN, token, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  if (nonce) {
    cookieStore.set(CART_NONCE, nonce, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
    });
  }
}

async function storeFetch(path: string, init?: RequestInit) {
  const cookieStore = await cookies();
  const token = cookieStore.get(CART_TOKEN)?.value;
  const nonce = cookieStore.get(CART_NONCE)?.value;

  const res = await fetch(`${getStoreApiBase()}${path}`, {
    ...init,
    headers: {
      ...buildHeaders(token, nonce),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  await persistSession(res);
  return res;
}

export async function getCart(): Promise<WooCart> {
  const res = await storeFetch("/cart");
  if (!res.ok) {
    throw new Error(`Cart fetch failed: ${res.status}`);
  }
  return res.json() as Promise<WooCart>;
}

export async function addToCart(productId: number, quantity = 1): Promise<WooCart> {
  const res = await storeFetch("/cart/add-item", {
    method: "POST",
    body: JSON.stringify({ id: productId, quantity }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Add to cart failed: ${res.status}`);
  }
  return res.json() as Promise<WooCart>;
}

export async function updateCartItem(
  key: string,
  quantity: number,
): Promise<WooCart> {
  const res = await storeFetch("/cart/update-item", {
    method: "POST",
    body: JSON.stringify({ key, quantity }),
  });
  if (!res.ok) {
    throw new Error(`Update cart failed: ${res.status}`);
  }
  return res.json() as Promise<WooCart>;
}

export async function removeCartItem(key: string): Promise<WooCart> {
  const res = await storeFetch("/cart/remove-item", {
    method: "POST",
    body: JSON.stringify({ key }),
  });
  if (!res.ok) {
    throw new Error(`Remove cart item failed: ${res.status}`);
  }
  return res.json() as Promise<WooCart>;
}

export async function applyCoupon(code: string): Promise<WooCart> {
  const res = await storeFetch("/cart/apply-coupon", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    throw new Error(await readStoreError(res));
  }
  return res.json() as Promise<WooCart>;
}

export async function removeCoupon(code: string): Promise<WooCart> {
  const res = await storeFetch("/cart/remove-coupon", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    throw new Error(await readStoreError(res));
  }
  return res.json() as Promise<WooCart>;
}

export async function updateCustomer(payload: {
  billing_address?: Partial<CheckoutPayload["billing_address"]>;
  shipping_address?: Partial<CheckoutPayload["shipping_address"]>;
}): Promise<WooCart> {
  const res = await storeFetch("/cart/update-customer", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await readStoreError(res));
  }
  return res.json() as Promise<WooCart>;
}

export async function selectShippingRate(
  rateId: string,
  packageId?: number | string,
): Promise<WooCart> {
  const body: { rate_id: string; package_id?: number | string } = {
    rate_id: rateId,
  };
  if (packageId !== undefined && packageId !== null && packageId !== "") {
    body.package_id = packageId;
  }
  const res = await storeFetch("/cart/select-shipping-rate", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await readStoreError(res));
  }
  return res.json() as Promise<WooCart>;
}

async function readStoreError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as {
      message?: string;
      data?: {
        params?: Record<string, string>;
        errors?: Record<string, string[]>;
        details?: Record<string, { message?: string }>;
      };
    };

    if (data.data?.errors) {
      const parts = Object.entries(data.data.errors).flatMap(([group, list]) =>
        list.map((msg) => {
          const clean = msg.replace(/^\s+/, "");
          if (clean === "is required" || clean.startsWith("is required")) {
            return group === "billing"
              ? "Postcode is required"
              : `${group}: ${clean}`;
          }
          return `${group}: ${clean}`;
        }),
      );
      if (parts.length) return parts.join(" · ");
    }

    if (data.data?.params) {
      const details = Object.values(data.data.params).join(" ");
      if (details) return details;
    }

    if (data.data?.details) {
      const details = Object.values(data.data.details)
        .map((item) => item.message)
        .filter(Boolean)
        .join(" ");
      if (details) return details;
    }

    if (data.message) return data.message;
  } catch {
    // ignore parse errors
  }
  return `Request failed: ${res.status}`;
}

export async function placeOrder(
  payload: CheckoutPayload,
): Promise<CheckoutResult> {
  const origin = payload.origin ?? "website";
  const res = await storeFetch("/checkout", {
    method: "POST",
    body: JSON.stringify({
      billing_address: payload.billing_address,
      shipping_address: payload.shipping_address,
      customer_note: payload.customer_note ?? "",
      create_account: false,
      payment_method: payload.payment_method,
      payment_data: [],
      extensions: {
        "woocommerce/order-attribution": buildOrderAttribution(origin),
      },
    }),
  });

  if (!res.ok) {
    throw new Error(await readStoreError(res));
  }

  return res.json() as Promise<CheckoutResult>;
}
