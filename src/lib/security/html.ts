/**
 * Lightweight, zero-dependency HTML sanitizer safe for Vercel serverless runtime.
 * Strips script tags, iframes, object/embed, dangerous protocols, and inline event handlers (on*).
 */
export function sanitizeProductHtml(html: string): string {
  if (!html) return "";

  // Remove dangerous executable blocks
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "");

  // Remove all inline event handlers (onerror=, onclick=, onload=, etc.)
  clean = clean.replace(/\son\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "");

  // Remove javascript:, data:, vbscript: protocols in href/src
  clean = clean.replace(
    /\s(href|src)\s*=\s*(['"]?)\s*(?:javascript|data|vbscript):/gi,
    " $1=$2#",
  );

  return clean;
}

export function stripHtml(html: string): string {
  return (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
