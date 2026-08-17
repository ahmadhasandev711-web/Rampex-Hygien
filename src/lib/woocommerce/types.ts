export type WooCurrency = {
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_prefix: string;
  currency_suffix: string;
};

export type WooImage = {
  id: number;
  src: string;
  thumbnail: string;
  name: string;
  alt: string;
};

export type WooProductPrices = WooCurrency & {
  price: string;
  regular_price: string;
  sale_price: string;
  price_range?: {
    min_amount: string;
    max_amount: string;
  } | null;
};

export type WooProductAttributeTerm = {
  id: number;
  name: string;
  slug: string;
};

export type WooProductAttribute = {
  id: number;
  name: string;
  taxonomy?: string | null;
  has_variations: boolean;
  terms: WooProductAttributeTerm[];
};

export type WooProductVariationRef = {
  id: number;
  attributes: { name: string; value: string }[];
};

export type WooProduct = {
  id: number;
  name: string;
  slug: string;
  type: string;
  parent?: number;
  permalink: string;
  short_description: string;
  description: string;
  on_sale: boolean;
  prices: WooProductPrices;
  images: WooImage[];
  categories: { id: number; name: string; slug: string }[];
  attributes?: WooProductAttribute[];
  variations?: WooProductVariationRef[];
  has_options?: boolean;
  is_purchasable: boolean;
  is_in_stock: boolean;
  average_rating: string;
  review_count: number;
};

export type WooCartItemVariation = {
  raw_attribute?: string;
  attribute: string;
  value: string;
};

export type WooCartItem = {
  key: string;
  id: number;
  quantity: number;
  name: string;
  summary: string;
  short_description: string;
  description: string;
  sku: string;
  low_stock_remaining: number | null;
  backorders_allowed: boolean;
  show_backorder_badge: boolean;
  sold_individually: boolean;
  permalink: string;
  images: WooImage[];
  variation?: WooCartItemVariation[];
  item_data?: { name: string; value: string; display?: string }[];
  prices: WooProductPrices & {
    line_subtotal: string;
    line_total: string;
  };
  totals: WooCurrency & {
    line_subtotal: string;
    line_total: string;
  };
  quantity_limits: {
    minimum: number;
    maximum: number;
    multiple_of: number;
    editable: boolean;
  };
};

export type WooAddress = {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone?: string;
  email?: string;
};

export type WooShippingRate = {
  rate_id: string;
  name: string;
  description?: string;
  delivery_time?: string;
  price: string;
  taxes?: string;
  instance_id?: number;
  method_id?: string;
  selected: boolean;
} & Partial<WooCurrency>;

export type WooShippingPackage = {
  package_id: number | string;
  name?: string;
  shipping_rates: WooShippingRate[];
};

export type WooCart = {
  items: WooCartItem[];
  items_count: number;
  needs_payment: boolean;
  needs_shipping: boolean;
  has_calculated_shipping?: boolean;
  payment_methods?: string[];
  billing_address?: WooAddress;
  shipping_address?: WooAddress;
  shipping_rates?: WooShippingPackage[];
  totals: WooCurrency & {
    total_items: string;
    total_items_tax: string;
    total_fees: string;
    total_fees_tax: string;
    total_discount: string;
    total_discount_tax: string;
    total_shipping: string | null;
    total_shipping_tax: string | null;
    total_price: string;
    total_tax: string;
  };
  coupons?: { code: string; totals?: WooCurrency & { total_discount: string } }[];
};

export type CheckoutPayload = {
  billing_address: Required<
    Pick<
      WooAddress,
      | "first_name"
      | "last_name"
      | "address_1"
      | "city"
      | "state"
      | "country"
      | "email"
      | "phone"
    >
  > &
    Partial<WooAddress>;
  shipping_address: Required<
    Pick<
      WooAddress,
      "first_name" | "last_name" | "address_1" | "city" | "state" | "country"
    >
  > &
    Partial<WooAddress>;
  customer_note?: string;
  payment_method: string;
  /** Shown in WooCommerce Orders → Origin column */
  origin?: "website" | "mobile_app";
};

export type CheckoutResult = {
  order_id: number;
  status: string;
  order_key: string;
  customer_note?: string;
  billing_address?: WooAddress;
  shipping_address?: WooAddress;
  payment_method?: string;
  payment_result?: {
    payment_status: string;
    payment_details: { key: string; value: string }[];
    redirect_url: string;
  };
};
