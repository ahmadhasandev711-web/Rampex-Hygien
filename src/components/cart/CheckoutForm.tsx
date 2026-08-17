"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useCart } from "@/components/cart/CartProvider";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import {
  loadCheckoutAddress,
  saveCheckoutAddress,
  type SavedCheckoutAddress,
} from "@/lib/storage/checkout-address";
import { saveRecentOrder } from "@/lib/storage/orders";
import {
  cityFromState,
  postcodeFromState,
  splitFullName,
} from "@/lib/woocommerce/checkout-defaults";
import { EGYPT_STATES } from "@/lib/woocommerce/egypt-states";
import { cartItemVariationLines } from "@/lib/woocommerce/cart-display";
import { formatWooPrice } from "@/lib/woocommerce/format";
import {
  flattenShippingRates,
  paymentMethodHelp,
  paymentMethodLabel,
} from "@/lib/woocommerce/payment-labels";
import { isAllowedPaymentRedirect } from "@/lib/security/request";
import type { CheckoutResult } from "@/lib/woocommerce/types";

type CheckoutFormProps = {
  locale: Locale;
  dict: Dictionary;
};

const inputClass =
  "w-full border border-line bg-paper px-3 py-3 text-navy outline-none transition focus:border-navy";

type FormState = {
  name: string;
  address_1: string;
  state: string;
  phone: string;
  email: string;
};

const emptyForm: FormState = {
  name: "",
  address_1: "",
  state: "EGC",
  phone: "",
  email: "",
};

function toForm(saved: SavedCheckoutAddress | null): FormState {
  if (!saved) return emptyForm;
  const name = [saved.first_name, saved.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return {
    name: name || saved.first_name || "",
    address_1: saved.address_1 || "",
    state: saved.state || "EGC",
    phone: saved.phone || "",
    email: saved.email || "",
  };
}

export function CheckoutForm({ locale, dict }: CheckoutFormProps) {
  const router = useRouter();
  const {
    cart,
    isLoading,
    refresh,
    applyCoupon,
    removeCoupon,
    updateCustomer,
    selectShipping,
  } = useCart();
  const [pending, startTransition] = useTransition();
  const [shippingPending, setShippingPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [hydrated, setHydrated] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  useEffect(() => {
    setForm(toForm(loadCheckoutAddress()));
    setHydrated(true);
  }, []);

  const methods = cart?.payment_methods?.length
    ? cart.payment_methods
    : ["cod"];

  useEffect(() => {
    if (!methods.includes(paymentMethod)) {
      setPaymentMethod(methods.includes("cod") ? "cod" : methods[0]);
    }
  }, [methods, paymentMethod]);

  const shippingOptions = useMemo(
    () => flattenShippingRates(cart?.shipping_rates),
    [cart?.shipping_rates],
  );

  // Recalculate shipping when governorate / address changes
  useEffect(() => {
    if (!hydrated || !cart?.items.length) return;

    const city = cityFromState(form.state, locale);
    const postcode = postcodeFromState(form.state);
    const { first_name, last_name } = splitFullName(form.name || "Customer");

    const address = {
      first_name: first_name || "Customer",
      last_name: last_name || "Customer",
      company: "",
      address_1: form.address_1.trim() || "Address",
      address_2: "",
      city,
      state: form.state,
      postcode,
      country: "EG",
      phone: form.phone.trim() || "0000000000",
      email: form.email.trim() || "checkout@rampex.local",
    };

    const timer = window.setTimeout(() => {
      setShippingPending(true);
      void updateCustomer({
        billing_address: address,
        shipping_address: address,
      }).finally(() => setShippingPending(false));
    }, 450);

    return () => window.clearTimeout(timer);
  }, [
    hydrated,
    form.state,
    form.address_1,
    form.name,
    form.phone,
    form.email,
    locale,
    cart?.items.length,
    updateCustomer,
  ]);

  if (isLoading || !hydrated) {
    return <p className="py-20 text-center text-muted">{dict.loading}</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted">{dict.checkout.empty}</p>
        <Link
          href={`/${locale}/products`}
          className="mt-6 inline-flex min-h-12 items-center bg-lime px-6 text-sm font-bold uppercase tracking-wide text-navy-deep"
        >
          {dict.cart.continue}
        </Link>
      </div>
    );
  }

  const subtotal = formatWooPrice(cart.totals.total_items, cart.totals);
  const discount = formatWooPrice(cart.totals.total_discount, cart.totals);
  const shippingTotal =
    cart.totals.total_shipping != null
      ? formatWooPrice(cart.totals.total_shipping, cart.totals)
      : null;
  const total = formatWooPrice(cart.totals.total_price, cart.totals);
  const appliedCoupons = cart.coupons ?? [];
  const hasDiscount = Number(cart.totals.total_discount) > 0;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    if (
      !form.name.trim() ||
      !form.address_1.trim() ||
      !form.state.trim() ||
      !form.phone.trim() ||
      !form.email.trim()
    ) {
      return dict.checkout.fillRequired;
    }
    if (shippingOptions.length > 0 && !shippingOptions.some((r) => r.selected)) {
      return dict.checkout.shippingSelect;
    }
    if (!methods.includes(paymentMethod)) {
      return dict.checkout.paymentSelect;
    }
    return null;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const { first_name, last_name } = splitFullName(form.name);
    const city = cityFromState(form.state, locale);
    const postcode = postcodeFromState(form.state);

    const billing = {
      first_name,
      last_name,
      company: "",
      address_1: form.address_1.trim(),
      address_2: "",
      city,
      state: form.state.trim(),
      postcode,
      country: "EG",
      email: form.email.trim(),
      phone: form.phone.trim(),
    };

    const shipping = {
      first_name,
      last_name,
      company: "",
      address_1: billing.address_1,
      address_2: "",
      city,
      state: billing.state,
      postcode,
      country: "EG",
      phone: billing.phone,
    };

    startTransition(async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            billing_address: billing,
            shipping_address: shipping,
            customer_note: "",
            payment_method: paymentMethod,
            origin: "website",
          }),
        });

        const data = (await res.json()) as CheckoutResult & {
          message?: string;
        };

        if (!res.ok) {
          setError(data.message || dict.error);
          return;
        }

        saveCheckoutAddress({
          first_name,
          last_name,
          address_1: billing.address_1,
          address_2: "",
          city,
          state: billing.state,
          postcode,
          phone: billing.phone,
          email: billing.email,
        });
        saveRecentOrder({
          orderId: data.order_id,
          email: billing.email,
          createdAt: new Date().toISOString(),
          total,
          status: data.status || "processing",
        });

        await refresh();

        const redirect = data.payment_result?.redirect_url;
        if (
          redirect &&
          !redirect.includes("order-received") &&
          isAllowedPaymentRedirect(redirect)
        ) {
          window.location.href = redirect;
          return;
        }

        router.push(
          `/${locale}/checkout/success?order=${encodeURIComponent(String(data.order_id))}&email=${encodeURIComponent(billing.email)}`,
        );
      } catch {
        setError(dict.error);
      }
    });
  }

  async function onApplyCoupon() {
    setCouponError(null);
    const code = couponCode.trim();
    if (!code) return;
    const result = await applyCoupon(code);
    if (!result.ok) {
      setCouponError(result.message || dict.error);
      return;
    }
    setCouponCode("");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12"
    >
      <section className="space-y-4">
        <h2 className="mb-2 text-xl font-bold text-navy">
          {dict.checkout.billing}
        </h2>

        <Field
          label={dict.checkout.name}
          name="name"
          required
          value={form.name}
          onChange={(v) => setField("name", v)}
        />

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-navy">
            {dict.checkout.country}
          </label>
          <input
            value={dict.checkout.countryValue}
            readOnly
            className={`${inputClass} bg-white text-muted`}
          />
        </div>

        <div>
          <label
            htmlFor="state"
            className="mb-1.5 block text-sm font-semibold text-navy"
          >
            {dict.checkout.state} <span className="text-lime-deep">*</span>
          </label>
          <select
            id="state"
            name="state"
            required
            value={form.state}
            onChange={(e) => setField("state", e.target.value)}
            className={inputClass}
          >
            {EGYPT_STATES.map((state) => (
              <option key={state.code} value={state.code}>
                {locale === "ar" ? state.nameAr : state.nameEn}
              </option>
            ))}
          </select>
        </div>

        <Field
          label={dict.checkout.address}
          name="address_1"
          required
          value={form.address_1}
          onChange={(v) => setField("address_1", v)}
        />

        <Field
          label={dict.checkout.phone}
          name="phone"
          required
          type="tel"
          value={form.phone}
          onChange={(v) => setField("phone", v)}
        />

        <Field
          label={dict.checkout.email}
          name="email"
          required
          type="email"
          value={form.email}
          onChange={(v) => setField("email", v)}
        />
      </section>

      <aside className="h-fit border border-line bg-white p-6 sm:p-7">
        <h2 className="mb-5 text-xl font-bold text-navy">
          {dict.checkout.order}
        </h2>

        <div className="space-y-4 border-b border-line pb-4">
          {cart.items.map((item) => {
            const image = item.images[0];
            const line = formatWooPrice(item.totals.line_total, item.totals);
            const variations = cartItemVariationLines(item);
            return (
              <div key={item.key} className="flex gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-paper">
                  {image ? (
                    <Image
                      src={image.thumbnail || image.src}
                      alt={image.alt || item.name}
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy">
                    {item.name}{" "}
                    <span className="text-muted">× {item.quantity}</span>
                  </p>
                  {variations.length > 0 ? (
                    <ul className="mt-1 space-y-0.5">
                      {variations.map((line) => (
                        <li
                          key={line}
                          className="text-xs capitalize text-muted"
                        >
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="mt-1 text-sm font-bold text-navy">{line}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3 border-b border-line py-4">
          <h3 className="text-sm font-bold uppercase tracking-wide text-navy">
            {dict.checkout.shipping}
          </h3>
          {shippingPending ? (
            <p className="text-sm text-muted">{dict.checkout.shippingCalculating}</p>
          ) : shippingOptions.length === 0 ? (
            <p className="text-sm text-muted">{dict.checkout.shippingEmpty}</p>
          ) : (
            <div className="space-y-2">
              {shippingOptions.map((rate) => {
                const price = formatWooPrice(rate.price, cart.totals);
                return (
                  <label
                    key={`${rate.package_id}-${rate.rate_id}`}
                    className="flex cursor-pointer items-start gap-3 border border-line bg-paper p-3"
                  >
                    <input
                      type="radio"
                      name="shipping_rate"
                      className="mt-1 accent-navy"
                      checked={rate.selected}
                      onChange={() => {
                        void selectShipping(rate.rate_id, rate.package_id);
                      }}
                    />
                    <span className="flex-1">
                      <span className="block font-semibold text-navy">
                        {rate.name}
                      </span>
                      {rate.description ? (
                        <span className="mt-0.5 block text-sm text-muted">
                          {rate.description}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-sm font-bold text-navy">{price}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-3 border-b border-line py-4">
          <label className="block text-sm font-semibold text-navy">
            {dict.checkout.coupon}
          </label>
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder={dict.checkout.couponPlaceholder}
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={() => void onApplyCoupon()}
              className="shrink-0 bg-navy px-4 text-sm font-semibold text-white"
            >
              {dict.checkout.applyCoupon}
            </button>
          </div>
          {couponError ? (
            <p className="text-sm text-red-700">{couponError}</p>
          ) : null}
          {appliedCoupons.map((coupon) => (
            <div
              key={coupon.code}
              className="flex items-center justify-between text-sm"
            >
              <span className="font-medium text-navy">{coupon.code}</span>
              <button
                type="button"
                className="text-muted underline"
                onClick={() => void removeCoupon(coupon.code)}
              >
                {dict.cart.remove}
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-b border-line py-4 text-sm">
          <Row label={dict.cart.subtotal} value={subtotal} />
          {hasDiscount ? (
            <Row label={dict.checkout.discount} value={`−${discount}`} />
          ) : null}
          {shippingTotal ? (
            <Row label={dict.checkout.shipping} value={shippingTotal} />
          ) : null}
          <Row label={dict.checkout.total} value={total} bold />
        </div>

        <div className="py-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy">
            {dict.checkout.payment}
          </h3>
          <div className="space-y-2">
            {methods.map((method) => (
              <label
                key={method}
                className="flex cursor-pointer items-start gap-3 border border-line bg-paper p-3"
              >
                <input
                  type="radio"
                  name="payment_method_ui"
                  className="mt-1 accent-navy"
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                />
                <span>
                  <span className="block font-semibold text-navy">
                    {paymentMethodLabel(method, locale)}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">
                    {paymentMethodHelp(method, locale)}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {error ? (
          <p className="mb-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full min-h-12 items-center justify-center bg-navy px-6 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-navy-soft disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? dict.checkout.placing : dict.checkout.placeOrder}
        </button>
      </aside>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-semibold text-navy"
      >
        {label}
        {required ? <span className="text-lime-deep"> *</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={bold ? "font-bold text-navy" : "text-muted"}>
        {label}
      </span>
      <span
        className={
          bold ? "text-lg font-bold text-navy" : "font-semibold text-navy"
        }
      >
        {value}
      </span>
    </div>
  );
}
