"use client";

import { useState, useEffect, useCallback, useRef, createContext, useContext, createElement, type ReactNode } from "react";
import type { User, AuthResponse } from "../types";
import { getUrl } from "../utils/domains";

/** Resolve API base lazily — ensures window.location is available on the client
 *  and avoids baking a .local domain during SSR/build. */
function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL || getUrl("api");
}

// ── Cookie-based auth: tokens live in HttpOnly cookies set by the server ──
// The browser sends them automatically with credentials: "include".
// No localStorage is used. A lightweight JS-readable cookie "africoders_logged_in"
// is used as a quick signal so the UI can skip network calls when not logged in.

/** Returns the correct cookie domain for the current environment. */
function getCookieDomain(): string {
  if (typeof window === "undefined") return ".africoders.com";
  return window.location.hostname.endsWith(".local") ? ".africoders.local" : ".africoders.com";
}

function setLoggedInFlag(): void {
  if (typeof document !== "undefined") {
    // Readable by JS across all subdomains, expires in 30 days
    document.cookie = `africoders_logged_in=1; path=/; domain=${getCookieDomain()}; max-age=2592000; SameSite=Lax; Secure`;
  }
}

function clearLoggedInFlag(): void {
  if (typeof document !== "undefined") {
    document.cookie = `africoders_logged_in=; path=/; domain=${getCookieDomain()}; max-age=0; SameSite=Lax; Secure`;
  }
}

function hasLoggedInFlag(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some(c => c.trim().startsWith("africoders_logged_in=1"));
}

// Clean up any legacy localStorage tokens from the old auth system
function clearLegacyTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("africoders_token");
  localStorage.removeItem("africoders_refresh");
}

interface AuthContextValue {
  user: User | null;
  /** @deprecated Use isAuthenticated for guards. Kept for backward compat — returns "cookie" when authed, null otherwise. */
  token: string | null;
  loading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  login: (login: string, password: string, turnstileToken?: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string, username?: string, turnstileToken?: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  socialLogin: (provider: string, redirectUrl?: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Schedule silent refresh 5 minutes before access token expires (55 min)
  const scheduleRefresh = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            setLoggedInFlag();
            scheduleRefresh();
            return;
          }
        }
      } catch {
        // refresh failed
      }
      setUser(null);
      clearLoggedInFlag();
    }, 55 * 60 * 1000); // 55 minutes
  }, []);

  const fetchUser = useCallback(async () => {
    // Clear any legacy localStorage tokens
    clearLegacyTokens();

    // Quick check: if no logged-in flag and no cookie, skip the network call
    if (!hasLoggedInFlag()) {
      // Still try /auth/me once in case there's an HttpOnly cookie
      // but the JS flag was cleared (e.g. user just logged in from another subdomain)
      try {
        const res = await fetch(`${getApiBase()}/api/v1/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          const u = data.user || data;
          setUser(u);
          setLoggedInFlag();
          scheduleRefresh();
          setLoading(false);
          return;
        }
      } catch {
        // not authenticated
      }
      setUser(null);
      setLoading(false);
      return;
    }

    // We have the flag — validate the session
    try {
      const res = await fetch(`${getApiBase()}/api/v1/auth/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const u = data.user || data;
        setUser(u);
        scheduleRefresh();
      } else if (res.status === 401) {
        // Access token expired, try refresh (cookie-based)
        try {
          const refreshRes = await fetch(`${getApiBase()}/api/v1/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.user) {
              setUser(refreshData.user);
              setLoggedInFlag();
              scheduleRefresh();
            } else {
              setUser(null);
              clearLoggedInFlag();
            }
          } else {
            setUser(null);
            clearLoggedInFlag();
          }
        } catch {
          setUser(null);
          clearLoggedInFlag();
        }
      } else {
        setUser(null);
        clearLoggedInFlag();
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [scheduleRefresh]);

  useEffect(() => {
    fetchUser();
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [fetchUser]);

  const login = async (loginId: string, password: string, turnstileToken?: string): Promise<AuthResponse> => {
    setError(null);
    const res = await fetch(`${getApiBase()}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ login: loginId, password, turnstile_token: turnstileToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || "Login failed");
    setUser(data.user);
    setLoggedInFlag();
    scheduleRefresh();
    return data;
  };

  const register = async (name: string, email: string, password: string, username?: string, turnstileToken?: string): Promise<AuthResponse> => {
    setError(null);
    const res = await fetch(`${getApiBase()}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password, username, turnstile_token: turnstileToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || "Registration failed");
    setUser(data.user);
    setLoggedInFlag();
    scheduleRefresh();
    return data;
  };

  const logout = async () => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    try {
      await fetch(`${getApiBase()}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore errors — clear local state anyway
    }
    clearLoggedInFlag();
    clearLegacyTokens();
    setUser(null);
  };

  const logoutAll = async () => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    try {
      await fetch(`${getApiBase()}/api/v1/auth/logout/all`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore errors
    }
    clearLoggedInFlag();
    clearLegacyTokens();
    setUser(null);
  };

  const socialLogin = (provider: string, redirectUrl?: string) => {
    let url = `${getApiBase()}/api/v1/auth/${provider}`;
    if (redirectUrl) {
      url += `?redirect_url=${encodeURIComponent(redirectUrl)}`;
    }
    window.location.href = url;
  };

  const value: AuthContextValue = {
    user,
    token: user ? "cookie" : null,
    loading,
    error,
    setError,
    login,
    register,
    logout,
    logoutAll,
    socialLogin,
    isAuthenticated: !!user,
  };

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
