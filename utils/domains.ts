/**
 * Central domain registry for Africoders platform.
 *
 * Usage:
 *   import { getDomain, getUrl } from "@shared/utils/domains";
 *   getDomain("africoders")   // "africoders.local" or "africoders.com"
 *   getUrl("academy")         // "https://academy.africoders.local" or "https://academy.africoders.com"
 *   getUrl("api")             // "https://api.africoders.local" or "https://api.africoders.com"
 *
 * Environment detection:
 *   - Reads NEXT_PUBLIC_ENV from the environment
 *   - Falls back to auto-detect from window.location.hostname
 *   - Values: "local" | "production"
 */

type Env = "local" | "production";

const domainMap: Record<Env, Record<string, string>> = {
  local: {
    africoders: "africoders.local",
    console: "console.africoders.local",
    academy: "academy.africoders.local",
    jobs: "jobs.africoders.local",
    noccea: "noccea.africoders.local",
    kortextools: "tools.africoders.local",
    afrihealthsys: "health.africoders.local",
    promptgist: "promptgist.africoders.local",
    spaces: "spaces.africoders.local",
    portal: "portal.africoders.local",
    api: "api.africoders.local",
    identity: "identity.africoders.local",
    observe: "observe.africoders.local",
  },
  production: {
    africoders: "africoders.com",
    console: "console.africoders.com",
    academy: "academy.africoders.com",
    jobs: "jobs.africoders.com",
    noccea: "noccea.africoders.com",
    kortextools: "tools.africoders.com",
    afrihealthsys: "health.africoders.com",
    promptgist: "promptgist.africoders.com",
    spaces: "spaces.africoders.com",
    portal: "portal.africoders.com",
    api: "api.africoders.com",
    identity: "identity.africoders.com",
    observe: "observe.africoders.com",
  },
};

function detectEnv(): Env {
  // Check explicit Next.js public env var first
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_ENV) {
    return process.env.NEXT_PUBLIC_ENV === "production" ? "production" : "local";
  }
  // Auto-detect from browser hostname (dev fallback)
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.endsWith(".local") || host === "localhost") return "local";
    return "production";
  }
  return "production";
}

let _env: Env | null = null;

export function getEnv(): Env {
  // Never cache on the server — each SSR request could be for a different context.
  // On the client, cache after first call (window.location is stable).
  if (typeof window === "undefined") return detectEnv();
  if (_env === null) _env = detectEnv();
  return _env;
}

/** Get the bare domain for a given app key. */
export function getDomain(app: string): string {
  const env = getEnv();
  return domainMap[env][app] ?? domainMap.local[app] ?? app;
}

/** Get the full URL for a given app key, with optional path. */
export function getUrl(app: string, path = ""): string {
  return `https://${getDomain(app)}${path}`;
}

/**
 * Returns the full base URLs for all apps that should receive auth broadcasts.
 * Identity itself is excluded (it sets its own token directly).
 */
export function getBroadcastTargets(): string[] {
  return [
    "africoders", "console", "academy", "jobs", "noccea",
    "kortextools", "afrihealthsys", "promptgist", "spaces", "portal",
  ].map((key) => getUrl(key));
}

/**
 * Build a login URL that redirects back to a given page after auth.
 * Works cross-domain: always points to the current app's own /login page.
 * The login page reads ?redirect_url= and redirects after success.
 *
 * Usage:
 *   getLoginUrl("/courses/java") → "/login?redirect_url=%2Fcourses%2Fjava"
 *   getLoginUrl()                → "/login"
 */
export function getLoginUrl(redirectPath?: string): string {
  if (!redirectPath) return "/login";
  return `/login?redirect_url=${encodeURIComponent(redirectPath)}`;
}

/**
 * Build a register URL with optional redirect after signup.
 */
export function getRegisterUrl(redirectPath?: string): string {
  if (!redirectPath) return "/register";
  return `/register?redirect_url=${encodeURIComponent(redirectPath)}`;
}

/** Get all product entries for the app switcher. */
export function getAllDomains(): Record<string, string> {
  return { ...domainMap[getEnv()] };
}
