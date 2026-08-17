export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "info@rampexhygiene.com";

/** Digits only, Egypt country code included (no +). */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP ?? "2027542375";

export const CONTACT_PHONES = [
  { display: "+20 27542375", tel: "+2027542375" },
  { display: "+20 25195345", tel: "+2025195345" },
] as const;

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildMailtoUrl(subject: string, body: string) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
