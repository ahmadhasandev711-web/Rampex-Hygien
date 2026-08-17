/** Build Store API `extensions["woocommerce/order-attribution"]` payload. */
export function buildOrderAttribution(origin: "website" | "mobile_app") {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  if (origin === "mobile_app") {
    return {
      source_type: "mobile_app",
      utm_source: "Mobile App",
      utm_medium: "app",
      utm_campaign: "(none)",
      session_entry: "rampex://",
      session_start_time: now,
      session_pages: "1",
      session_count: "1",
      user_agent: "RampexHygieneMobile/1.0",
    };
  }

  return {
    source_type: "utm",
    utm_source: "Website",
    utm_medium: "website",
    utm_campaign: "(none)",
    session_entry: "/",
    session_start_time: now,
    session_pages: "1",
    session_count: "1",
    user_agent: "RampexHygieneWeb/1.0",
  };
}
