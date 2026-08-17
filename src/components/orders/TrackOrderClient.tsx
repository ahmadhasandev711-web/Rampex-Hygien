"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import {
  findLocalOrder,
  loadRecentOrders,
  type LocalOrder,
} from "@/lib/storage/orders";

type TrackOrderClientProps = {
  locale: Locale;
  dict: Dictionary;
  initialOrder?: string;
  initialEmail?: string;
};

export function TrackOrderClient({
  locale,
  dict,
  initialOrder = "",
  initialEmail = "",
}: TrackOrderClientProps) {
  const [orderId, setOrderId] = useState(initialOrder);
  const [email, setEmail] = useState(initialEmail);
  const [result, setResult] = useState<LocalOrder | null | undefined>(undefined);
  const [recent, setRecent] = useState<LocalOrder[]>([]);

  useEffect(() => {
    setRecent(loadRecentOrders());
  }, []);

  const inputClass =
    "w-full border border-line bg-white px-3 py-3 text-navy outline-none focus:border-navy";

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const id = Number(orderId);
    if (!id || !email.trim()) {
      setResult(null);
      return;
    }
    setResult(findLocalOrder(id, email));
  }

  const dateLabel = useMemo(() => {
    if (!result) return "";
    try {
      return new Date(result.createdAt).toLocaleString(
        locale === "ar" ? "ar-EG" : "en-GB",
      );
    } catch {
      return result.createdAt;
    }
  }, [result, locale]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-16">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-navy">
        {dict.track.title}
      </h1>
      <p className="mt-3 text-muted">{dict.track.subtitle}</p>

      <form onSubmit={onSubmit} className="mt-10 space-y-4 bg-white p-6">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy">
            {dict.track.orderId}
          </label>
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className={inputClass}
            inputMode="numeric"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy">
            {dict.track.email}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-12 items-center bg-navy px-6 text-sm font-bold uppercase tracking-wide text-white"
        >
          {dict.track.submit}
        </button>
      </form>

      {result === null ? (
        <p className="mt-6 text-sm text-red-700">{dict.track.notFound}</p>
      ) : null}

      {result ? (
        <div className="mt-6 space-y-2 border border-line bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-lime-deep">
            {dict.track.found}
          </p>
          <p className="text-xl font-bold text-navy">
            {dict.checkout.orderNumber}: #{result.orderId}
          </p>
          <p className="text-sm text-muted">
            {dict.track.status}: {result.status}
          </p>
          <p className="text-sm text-muted">
            {dict.track.date}: {dateLabel}
          </p>
          {result.total ? (
            <p className="text-sm font-semibold text-navy">{result.total}</p>
          ) : null}
        </div>
      ) : null}

      <p className="mt-6 text-sm text-muted">{dict.track.emailNote}</p>

      <div className="mt-12">
        <h2 className="mb-4 text-lg font-bold text-navy">{dict.track.recent}</h2>
        {recent.length === 0 ? (
          <p className="text-muted">{dict.track.empty}</p>
        ) : (
          <ul className="space-y-3">
            {recent.map((order) => (
              <li key={order.orderId}>
                <button
                  type="button"
                  className="w-full border border-line bg-white px-4 py-3 text-start transition hover:border-navy"
                  onClick={() => {
                    setOrderId(String(order.orderId));
                    setEmail(order.email);
                    setResult(order);
                  }}
                >
                  <span className="font-semibold text-navy">
                    #{order.orderId}
                  </span>
                  <span className="ms-3 text-sm text-muted">{order.status}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        href={`/${locale}/products`}
        className="mt-10 inline-flex text-sm font-semibold text-navy underline"
      >
        {dict.cart.continue}
      </Link>
    </div>
  );
}
