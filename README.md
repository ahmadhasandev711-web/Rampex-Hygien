# Rampex Hygiene — Next.js Storefront

Headless storefront for [Rampex Hygiene](https://ivory-armadillo-568207.hostingersite.com/) using **Next.js + TypeScript**, powered by **WordPress + WooCommerce** as the backend.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- Bilingual: English / Arabic (RTL)
- WooCommerce Store API for products & cart

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.local`:

```
NEXT_PUBLIC_WP_URL=https://ivory-armadillo-568207.hostingersite.com
NEXT_PUBLIC_SITE_NAME=Rampex Hygiene
```

## Notes

- Product catalog is fetched from WooCommerce Store API.
- Cart actions go through `/api/cart` (server proxy) to keep the session with WordPress.
- Checkout currently redirects to the WordPress checkout page.
