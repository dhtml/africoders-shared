/**
 * Track a custom event in Google Analytics (GA4).
 *
 * Safe to call anywhere — silently no-ops if gtag isn't loaded
 * (e.g. in local dev, SSR, or when GA is blocked).
 *
 * @example
 *   trackEvent("enroll_course", { course_id: "42", course_title: "Intro to APIs" });
 *   trackEvent("search_places", { query: "hospitals", country: "NG" });
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}
