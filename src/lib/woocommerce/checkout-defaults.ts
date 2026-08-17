import { EGYPT_STATES } from "@/lib/woocommerce/egypt-states";

/** WooCommerce still needs city + postcode — filled automatically from governorate. */
const STATE_POSTCODES: Record<string, string> = {
  EGC: "11511",
  EGGZ: "12511",
  EGALX: "21500",
  EGKB: "13621",
  EGSHR: "44629",
  EGDK: "35111",
  EGBH: "22511",
  EGGH: "31611",
  EGMNF: "32511",
  EGKFS: "33511",
  EGDT: "34511",
  EGPTS: "42511",
  EGIS: "41511",
  EGSUZ: "43511",
  EGBA: "84511",
  EGWAD: "72511",
  EGMT: "51511",
  EGKN: "83511",
  EGAST: "71511",
  EGSHG: "82511",
  EGASN: "81511",
  EGLX: "85511",
  EGBNS: "62511",
  EGFYM: "63511",
  EGMN: "61511",
  EGJS: "46619",
  EGSIN: "45617",
};

export function splitFullName(fullName: string): {
  first_name: string;
  last_name: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_name: "", last_name: "" };
  if (parts.length === 1) return { first_name: parts[0], last_name: parts[0] };
  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(" "),
  };
}

export function cityFromState(stateCode: string, locale: "en" | "ar" = "en") {
  const state = EGYPT_STATES.find((s) => s.code === stateCode);
  if (!state) return locale === "ar" ? "مصر" : "Egypt";
  return locale === "ar" ? state.nameAr : state.nameEn;
}

export function postcodeFromState(stateCode: string) {
  return STATE_POSTCODES[stateCode] ?? "11511";
}
