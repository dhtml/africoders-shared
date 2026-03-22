"use client";

import React, { useEffect } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

const COOKIE_NAME = "africoders_theme";

function getRootDomain(): string {
  if (typeof window === "undefined") return "";
  const parts = window.location.hostname.split(".");
  // e.g. places.africoders.local → .africoders.local
  // e.g. africoders.com → .africoders.com
  if (parts.length >= 2) {
    return "." + parts.slice(-2).join(".");
  }
  return window.location.hostname;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, domain: string) {
  const maxAge = 365 * 24 * 60 * 60; // 1 year
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; domain=${domain}; max-age=${maxAge}; SameSite=Lax`;
}

/** Syncs theme changes to a cross-subdomain cookie */
function ThemeCookieSync() {
  const { theme, resolvedTheme } = useTheme();
  const effectiveTheme = theme === "system" ? resolvedTheme : theme;

  // On mount: read cookie and apply if it differs from localStorage
  useEffect(() => {
    const cookieTheme = getCookie(COOKIE_NAME);
    if (cookieTheme && cookieTheme !== theme) {
      // The cookie wins — another subdomain changed the theme
      // We'll update localStorage so next-themes picks it up
      try {
        localStorage.setItem("theme", cookieTheme);
        // Trigger a storage event for next-themes to pick up
        window.dispatchEvent(new StorageEvent("storage", { key: "theme", newValue: cookieTheme }));
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When theme changes: write to cookie
  useEffect(() => {
    if (effectiveTheme) {
      const domain = getRootDomain();
      if (domain) {
        setCookie(COOKIE_NAME, effectiveTheme, domain);
      }
    }
  }, [effectiveTheme]);

  return null;
}

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeCookieSync />
      {children}
    </NextThemesProvider>
  );
}
