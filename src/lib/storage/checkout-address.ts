export type SavedCheckoutAddress = {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  phone: string;
  email: string;
};

const KEY = "rampex_checkout_address";

export function loadCheckoutAddress(): SavedCheckoutAddress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedCheckoutAddress;
  } catch {
    return null;
  }
}

export function saveCheckoutAddress(address: SavedCheckoutAddress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(address));
}
