/** Detect color / size attributes and map term names to swatch hex. */

const COLOR_KEYS = ["color", "colour", "لون", "اللون", "pa_color", "pa_colour"];
const SIZE_KEYS = [
  "size",
  "sizes",
  "مقاس",
  "المقاس",
  "حجم",
  "pa_size",
  "pa_sizes",
];

const SWATCHES: Record<string, string> = {
  black: "#111111",
  white: "#f5f5f5",
  red: "#c62828",
  blue: "#1565c0",
  navy: "#1a2757",
  green: "#2e7d32",
  lime: "#8dc63f",
  yellow: "#f9a825",
  orange: "#ef6c00",
  pink: "#ec407a",
  purple: "#7b1fa2",
  violet: "#7b1fa2",
  brown: "#6d4c41",
  beige: "#d7ccc8",
  grey: "#9e9e9e",
  gray: "#9e9e9e",
  silver: "#bdbdbd",
  gold: "#c9a227",
  cream: "#f5f0e6",
  maroon: "#7f1d1d",
  teal: "#00897b",
  cyan: "#00acc1",
  olive: "#808000",
  coral: "#ff7043",
  // Arabic common names
  اسود: "#111111",
  أسود: "#111111",
  ابيض: "#f5f5f5",
  أبيض: "#f5f5f5",
  احمر: "#c62828",
  أحمر: "#c62828",
  ازرق: "#1565c0",
  أزرق: "#1565c0",
  اخضر: "#2e7d32",
  أخضر: "#2e7d32",
  اصفر: "#f9a825",
  أصفر: "#f9a825",
  برتقالي: "#ef6c00",
  وردي: "#ec407a",
  بنفسجي: "#7b1fa2",
  بني: "#6d4c41",
  رمادي: "#9e9e9e",
  ذهبي: "#c9a227",
};

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ");
}

function matchesKey(value: string | null | undefined, keys: string[]) {
  if (!value) return false;
  const n = normalizeKey(value).replace(/\s+/g, "");
  return keys.some((k) => n.includes(k.replace(/\s+/g, "").toLowerCase()));
}

export function isColorAttribute(
  name: string,
  taxonomy?: string | null,
) {
  return matchesKey(name, COLOR_KEYS) || matchesKey(taxonomy, COLOR_KEYS);
}

export function isSizeAttribute(
  name: string,
  taxonomy?: string | null,
) {
  return matchesKey(name, SIZE_KEYS) || matchesKey(taxonomy, SIZE_KEYS);
}

export function resolveSwatchColor(slugOrName: string): string | null {
  const raw = slugOrName.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return raw;

  const key = normalizeKey(raw);
  if (SWATCHES[key]) return SWATCHES[key];

  // try first word (e.g. "dark blue")
  const first = key.split(/\s+/)[0];
  if (first && SWATCHES[first]) return SWATCHES[first];

  // strip spaces for arabic compounds
  const compact = key.replace(/\s+/g, "");
  if (SWATCHES[compact]) return SWATCHES[compact];

  return null;
}

export function isLightSwatch(hex: string) {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 180;
}
