"use client";

import { useState, useTransition } from "react";
import { useCart } from "@/components/cart/CartProvider";
import type { Dictionary } from "@/i18n/dictionaries";

type AddToCartButtonProps = {
  productId: number;
  dict: Dictionary;
  disabled?: boolean;
  max?: number;
};

export function AddToCartButton({
  productId,
  dict,
  disabled,
  max = 99,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  function clamp(value: number) {
    return Math.min(max, Math.max(1, value));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-stretch border border-line bg-white">
          <button
            type="button"
            aria-label="−"
            disabled={disabled || pending || qty <= 1}
            onClick={() => setQty((v) => clamp(v - 1))}
            className="inline-flex min-h-12 w-11 items-center justify-center text-lg font-bold text-navy transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={max}
            value={qty}
            aria-label={dict.cart.quantity}
            disabled={disabled || pending}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (Number.isFinite(next)) setQty(clamp(next));
            }}
            className="w-14 border-x border-line bg-paper text-center text-base font-bold text-navy outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            aria-label="+"
            disabled={disabled || pending || qty >= max}
            onClick={() => setQty((v) => clamp(v + 1))}
            className="inline-flex min-h-12 w-11 items-center justify-center text-lg font-bold text-navy transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>

        <button
          type="button"
          disabled={disabled || pending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await addItem(productId, qty);
              if (result.ok) {
                setDone(true);
                window.setTimeout(() => setDone(false), 1600);
              } else {
                setError(result.message || dict.error);
              }
            });
          }}
          className="inline-flex min-h-12 items-center justify-center bg-lime px-6 text-sm font-bold uppercase tracking-wide text-navy-deep transition hover:bg-lime-deep hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin text-navy-deep"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>{dict.cart.updating}</span>
            </span>
          ) : done ? (
            dict.added
          ) : disabled ? (
            dict.products.outOfStock
          ) : (
            dict.products.addToCart
          )}
        </button>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
