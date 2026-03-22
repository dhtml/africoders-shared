interface Window {
  gtag: (
    command: "event" | "config" | "js" | "set",
    targetOrEvent: string | Date,
    params?: Record<string, unknown>,
  ) => void;
  dataLayer: unknown[];
}
