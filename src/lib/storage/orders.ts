export type LocalOrder = {
  orderId: number;
  email: string;
  createdAt: string;
  total?: string;
  status: string;
};

const KEY = "rampex_recent_orders";
const MAX = 20;

export function loadRecentOrders(): LocalOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalOrder[];
  } catch {
    return [];
  }
}

export function saveRecentOrder(order: LocalOrder) {
  if (typeof window === "undefined") return;
  const prev = loadRecentOrders().filter((o) => o.orderId !== order.orderId);
  const next = [order, ...prev].slice(0, MAX);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function findLocalOrder(
  orderId: number,
  email: string,
): LocalOrder | null {
  const needle = email.trim().toLowerCase();
  return (
    loadRecentOrders().find(
      (o) => o.orderId === orderId && o.email.toLowerCase() === needle,
    ) ?? null
  );
}
