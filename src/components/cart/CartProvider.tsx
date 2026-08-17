"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import type { WooAddress, WooCart } from "@/lib/woocommerce/types";

type CartContextValue = {
  cart: WooCart | null;
  count: number;
  isLoading: boolean;
  isPending: boolean;
  refresh: () => Promise<void>;
  addItem: (
    productId: number,
    quantity?: number,
  ) => Promise<{ ok: boolean; message?: string }>;
  updateItem: (key: string, quantity: number) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<{ ok: boolean; message?: string }>;
  removeCoupon: (code: string) => Promise<{ ok: boolean; message?: string }>;
  updateCustomer: (payload: {
    billing_address?: Partial<WooAddress>;
    shipping_address?: Partial<WooAddress>;
  }) => Promise<{ ok: boolean; message?: string }>;
  selectShipping: (
    rateId: string,
    packageId?: number | string,
  ) => Promise<{ ok: boolean; message?: string }>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<WooCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        setCart((await res.json()) as WooCart);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (productId: number, quantity = 1) => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", productId, quantity }),
      });
      const data = (await res.json()) as WooCart & { message?: string };
      if (!res.ok) {
        return {
          ok: false,
          message: data.message || "Could not add to cart.",
        };
      }
      startTransition(() => setCart(data));
      return { ok: true };
    },
    [],
  );

  const updateItem = useCallback(async (key: string, quantity: number) => {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", key, quantity }),
    });
    if (!res.ok) return;
    const next = (await res.json()) as WooCart;
    startTransition(() => setCart(next));
  }, []);

  const removeItem = useCallback(async (key: string) => {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", key }),
    });
    if (!res.ok) return;
    const next = (await res.json()) as WooCart;
    startTransition(() => setCart(next));
  }, []);

  const applyCoupon = useCallback(async (code: string) => {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "apply_coupon", code }),
    });
    const data = (await res.json()) as WooCart & { message?: string };
    if (!res.ok) return { ok: false, message: data.message };
    startTransition(() => setCart(data));
    return { ok: true };
  }, []);

  const removeCoupon = useCallback(async (code: string) => {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove_coupon", code }),
    });
    const data = (await res.json()) as WooCart & { message?: string };
    if (!res.ok) return { ok: false, message: data.message };
    startTransition(() => setCart(data));
    return { ok: true };
  }, []);

  const updateCustomer = useCallback(
    async (payload: {
      billing_address?: Partial<WooAddress>;
      shipping_address?: Partial<WooAddress>;
    }) => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_customer", ...payload }),
      });
      const data = (await res.json()) as WooCart & { message?: string };
      if (!res.ok) return { ok: false, message: data.message };
      startTransition(() => setCart(data));
      return { ok: true };
    },
    [],
  );

  const selectShipping = useCallback(
    async (rateId: string, packageId?: number | string) => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "select_shipping",
          rateId,
          packageId,
        }),
      });
      const data = (await res.json()) as WooCart & { message?: string };
      if (!res.ok) return { ok: false, message: data.message };
      startTransition(() => setCart(data));
      return { ok: true };
    },
    [],
  );

  const value = useMemo(
    () => ({
      cart,
      count: cart?.items_count ?? 0,
      isLoading,
      isPending,
      refresh,
      addItem,
      updateItem,
      removeItem,
      applyCoupon,
      removeCoupon,
      updateCustomer,
      selectShipping,
    }),
    [
      cart,
      isLoading,
      isPending,
      refresh,
      addItem,
      updateItem,
      removeItem,
      applyCoupon,
      removeCoupon,
      updateCustomer,
      selectShipping,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
