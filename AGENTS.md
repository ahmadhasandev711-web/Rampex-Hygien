# AGENTS.md — Rampex Hygiene

Guide for AI agents working on this repository. Read this before changing code.

> **CRITICAL RULE**: ALWAYS present a plan and obtain EXPLICIT APPROVAL from the user before making any code changes or taking any major decisions. You MUST NOT skip the planning phase.

---

## Monorepo layout

| Path | App | Stack |
|------|-----|--------|
| Repo root (`/`) | **Web storefront** | Next.js 16 + TypeScript + Tailwind v4 |
| `rampex-web/` | **Mobile storefront** | Expo SDK 54 + React Native 0.81 + Expo Router |

Both apps talk to the **same** WordPress + WooCommerce backend. Keep product/cart/checkout behavior aligned when possible.

---

## What this project is

**Rampex Hygiene** headless e-commerce (web + mobile).

| Layer | Tech | Role |
|--------|------|------|
| **Web frontend** | Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + React 19 | Public website UI |
| **Mobile frontend** | Expo 54 + RN 0.81 + Expo Router + TypeScript | iOS / Android app |
| **Backend** | WordPress + WooCommerce (Hostinger) | Products, cart session, orders, admin |

**WordPress is backend-only.** Customers must shop and checkout in our apps — never rely on WP theme cart/checkout as the primary UX.

- Live WP backend: `https://ivory-armadillo-568207.hostingersite.com`
- Brand: paper tissue / hygiene products for hotels, hospitals, resorts, restaurants, cafés (Egypt, EGP)
- Founder: **Dr. Hoda G. Yassa** (Founder & CEO)

---

## Quick start

### Web (repo root)

```bash
npm install
npm run dev      # http://localhost:3000 → redirects to /en
npm run build
npm run lint
```

Web env (`.env.local`):

```env
NEXT_PUBLIC_WP_URL=https://ivory-armadillo-568207.hostingersite.com
NEXT_PUBLIC_SITE_NAME=Rampex Hygiene
```

### Mobile (`rampex-web/`)

```bash
cd rampex-web
npm install
npx expo start
```

Mobile env (`rampex-web/.env`):

```env
EXPO_PUBLIC_WP_URL=https://ivory-armadillo-568207.hostingersite.com
```

**Important:** Install native packages with `npx expo install <pkg>` so versions match Expo SDK 54. `.npmrc` uses `legacy-peer-deps=true` for peer conflicts.

Pinned mobile stack (compatible with **Play Store Expo Go**):

- `expo ~54.0.0` (SDK 54 — what Expo Go on stores currently ships)
- `react-native 0.81.x`
- `react 19.1.x`
- `expo-router ~6`

Do **not** jump to SDK 55+ unless the team moves to a development build / `eas go`. Store Expo Go may lag behind the latest SDK.

---

## Architecture

```
Web browser / Mobile app
  → WooCommerce Store API
  → Orders appear in WooCommerce admin
```

### WooCommerce APIs used

Base: `{WP_URL}/wp-json/wc/store/v1`

| Endpoint | Use |
|----------|-----|
| `GET /products` | Catalog, filters (`on_sale`, `orderby`, `slug`, `related`) |
| `GET/POST /cart` | Cart read |
| `POST /cart/add-item` | Add product |
| `POST /cart/update-item` | Change qty |
| `POST /cart/remove-item` | Remove line |
| `POST /cart/update-customer` | Address → recalculate shipping rates |
| `POST /cart/select-shipping-rate` | Choose shipping method |
| `POST /cart/apply-coupon` / `remove-coupon` | Coupons |
| `POST /checkout` | Place order |

**Web session:** `Cart-Token` + `Nonce` in httpOnly cookies via Next.js `/api/cart` and `/api/checkout`.

**Mobile session:** same headers persisted in AsyncStorage (`wc_cart_token`, `wc_store_nonce`) in `rampex-web/src/lib/woocommerce/api.ts`.

**Shipping & payments:** Apps read rates (`shipping_rates`) and gateways (`payment_methods`) from the cart Store API response. They do **not** hardcode prices or gateways — configure everything in WooCommerce admin.

---

## Web folder map

```
src/
  app/
    layout.tsx                 # Root html/body, fonts, lang/dir from x-locale
    globals.css                # Design tokens + animations
    proxy.ts                   # Locale redirect + x-locale header (Next.js Proxy)
    api/cart/route.ts          # Cart proxy
    api/checkout/route.ts      # Checkout proxy
    [locale]/                 # Home, products, cart, checkout, about, contact
  components/                  # layout, home, products, cart, contact
  i18n/                        # en + ar dictionaries
  lib/woocommerce/             # Store API helpers
public/brand/logo-mark.png     # Transparent logo
```

## Mobile folder map (`rampex-web/`)

```
app/
  _layout.tsx                  # Providers + Stack
  (tabs)/                      # Home, Shop, Cart, More
  product/[slug].tsx
  checkout/index.tsx
  checkout/success.tsx
  about.tsx
  contact.tsx                  # Includes map WebView
src/
  theme.ts                     # Colors + WP URL + media
  i18n.tsx                     # en/ar
  cart.tsx                     # CartProvider
  components/ui.tsx
  lib/woocommerce/             # Store API + AsyncStorage session
```

---

## Features shipped (web + mobile)

| Feature | Notes |
|---------|--------|
| Contact form | WhatsApp + email (`NEXT_PUBLIC_WHATSAPP` / `NEXT_PUBLIC_CONTACT_EMAIL`) |
| Checkout address memory | localStorage / AsyncStorage |
| Coupons | Store API `apply-coupon` / `remove-coupon` |
| Shipping rates | From WC shipping zones via `update-customer` + `select-shipping-rate` |
| Payment methods | Dynamic from cart `payment_methods` (COD today; more when enabled in WP) |
| Order track | Device-local recent orders (`/track`) — Woo emails still from WP |
| Search / sale filter | Products query params |
| Wishlist | Device-local |
| SEO | `sitemap.ts`, `robots.ts`, Open Graph base |
| RTL language switch | Web hard navigation; mobile reload via `reloadAppAsync` |
| Deep links | App scheme `rampex://` + https hosts in `app.json` |

**Not in scope / company WP ops:** PWA (skipped), push notifications, admin sales dashboard, product photography in WP media.

### WooCommerce checklist (company / ops)

Apps are ready — once these are set in WP, they appear automatically in web + mobile checkout:

1. **Shipping zones** — WooCommerce → Settings → Shipping: Egypt (or governorate zones) + flat rate / free shipping / local pickup as needed. Products must be shippable (`needs_shipping`).
2. **Payment gateways** — enable COD and any Store-API-compatible plugins (Paymob, Fawry, Stripe, etc.). Gateways that only work on the classic WP checkout theme may **not** show in headless Store API.
3. **Coupons** — Marketing → Coupons; apps already apply/remove codes.
4. **Emails** — WP still sends order emails; apps only show local order history.

---

## Checkout — critical rules (web + mobile)

1. Checkout is in-app / on Next.js — not WP theme checkout.
2. Egypt `state` codes required (e.g. `EGC`) — see `egypt-states.ts` in both apps.
3. **`postcode` is required** by this store — checkout UI no longer asks for it; apps auto-fill from governorate. Empty postcode → vague `" is required"` error if ever sent blank.
4. Payment method: chosen from cart `payment_methods` (validated server-side on web).
5. Shipping: customer address updates cart → rates listed → selected before place order when rates exist.
6. Simplified checkout fields: **name, country, governorate, address, mobile, email**.
7. Order **Origin**: web sends Website; mobile sends Mobile app (Store API `woocommerce/order-attribution`).
8. If gateway returns `payment_result.redirect_url`, open it (web navigate / mobile `Linking`).

---

## Brand

| Token | Hex |
|-------|-----|
| Navy | `#1a2757` / `#121c3f` |
| Lime | `#8dc63f` |
| Paper | `#f5f7f2` |

Prefer calm premium hospitality UI. Founder photo clear on About only — not as washed hero background.

---

## Do / Don’t

**Do**

- Keep web & mobile API behavior aligned
- Use `npx expo install` inside `rampex-web`
- Keep bilingual copy in sync

**Don’t**

- Redirect primary checkout to WordPress
- Upgrade Expo/RN packages randomly without `expo install`
- Assume empty Egypt postcode is OK
- Add a PWA — full mobile app exists instead
