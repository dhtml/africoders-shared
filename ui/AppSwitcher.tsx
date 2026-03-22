"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  GraduationCap, Code, Sparkles, Building2, Wrench,
  HeartPulse, Briefcase, LayoutGrid, Globe,
  Braces, Radio, BookOpen, Activity, MonitorDot, Users, MapPin, Map, Shield,
  FileText, HardDrive,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "../utils/cn";
import { getUrl } from "../utils/domains";
import { trackEvent } from "../utils/analytics";
import { motion, AnimatePresence } from "framer-motion";

interface RegistryApp {
  name: string;
  slug: string;
  icon: string;
  color: string;
  domain: string;
  url: string;
  description?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  "braces": <Braces className="h-5 w-5" />,
  "code": <Code className="h-5 w-5" />,
  "graduation-cap": <GraduationCap className="h-5 w-5" />,
  "radio": <Radio className="h-5 w-5" />,
  "sparkles": <Sparkles className="h-5 w-5" />,
  "building-2": <Building2 className="h-5 w-5" />,
  "wrench": <Wrench className="h-5 w-5" />,
  "heart-pulse": <HeartPulse className="h-5 w-5" />,
  "briefcase": <Briefcase className="h-5 w-5" />,
  "globe": <Globe className="h-5 w-5" />,
  "book-open": <BookOpen className="h-5 w-5" />,
  "activity": <Activity className="h-5 w-5" />,
  "monitor-dot": <MonitorDot className="h-5 w-5" />,
  "users": <Users className="h-5 w-5" />,
  "map-pin": <MapPin className="h-5 w-5" />,
  "map": <Map className="h-5 w-5" />,
  "shield": <Shield className="h-5 w-5" />,
  "file-text": <FileText className="h-5 w-5" />,
  "hard-drive": <HardDrive className="h-5 w-5" />,
};

const colorMap: Record<string, { bg: string; text: string }> = {
  "emerald":  { bg: "bg-emerald-100 dark:bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400" },
  "slate":    { bg: "bg-slate-100 dark:bg-slate-500/15",     text: "text-slate-600 dark:text-slate-400" },
  "blue":     { bg: "bg-blue-100 dark:bg-blue-500/15",       text: "text-blue-600 dark:text-blue-400" },
  "amber":    { bg: "bg-amber-100 dark:bg-amber-500/15",     text: "text-amber-600 dark:text-amber-400" },
  "orange":   { bg: "bg-orange-100 dark:bg-orange-500/15",   text: "text-orange-600 dark:text-orange-400" },
  "pink":     { bg: "bg-pink-100 dark:bg-pink-500/15",       text: "text-pink-600 dark:text-pink-400" },
  "red":      { bg: "bg-red-100 dark:bg-red-500/15",         text: "text-red-600 dark:text-red-400" },
  "purple":   { bg: "bg-purple-100 dark:bg-purple-500/15",   text: "text-purple-600 dark:text-purple-400" },
  "teal":     { bg: "bg-teal-100 dark:bg-teal-500/15",       text: "text-teal-600 dark:text-teal-400" },
  "violet":   { bg: "bg-violet-100 dark:bg-violet-500/15",   text: "text-violet-600 dark:text-violet-400" },
  "indigo":   { bg: "bg-indigo-100 dark:bg-indigo-500/15",   text: "text-indigo-600 dark:text-indigo-400" },
  "cyan":     { bg: "bg-cyan-100 dark:bg-cyan-500/15",       text: "text-cyan-600 dark:text-cyan-400" },
  "sky":      { bg: "bg-sky-100 dark:bg-sky-500/15",         text: "text-sky-600 dark:text-sky-400" },
  "green":    { bg: "bg-green-100 dark:bg-green-500/15",     text: "text-green-600 dark:text-green-400" },
};

const fallbackColors = { bg: "bg-gray-100 dark:bg-gray-500/15", text: "text-gray-600 dark:text-gray-400" };

// 5-minute in-memory cache so each app only fetches once per session
let _cachedApps: RegistryApp[] | null = null;
let _cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function fetchApps(apiBase: string): Promise<RegistryApp[]> {
  const now = Date.now();
  if (_cachedApps && now - _cacheTime < CACHE_TTL) return _cachedApps;
  try {
    const res = await fetch(`${apiBase}/api/v1/registry`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    _cachedApps = data.apps ?? [];
    _cacheTime = now;
    return _cachedApps!;
  } catch {
    return _cachedApps ?? [];
  }
}

export function AppSwitcher() {
  const [apps, setApps] = useState<RegistryApp[]>([]);
  const [open, setOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  // Fetch registry once on mount
  useEffect(() => {
    const apiBase = getUrl("api");
    fetchApps(apiBase).then(setApps);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-app-switcher]")) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleKeyDown]);

  return (
    <div className="relative" data-app-switcher>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "p-2 rounded-lg transition-all duration-200",
          open
            ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
            : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white"
        )}
        title="Switch App"
        aria-label="Open app switcher"
        aria-expanded={open}
      >
        <LayoutGrid className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 rounded-2xl border overflow-hidden max-sm:fixed max-sm:inset-x-3 max-sm:right-3 max-sm:top-auto max-sm:bottom-20"
            style={{
              width: undefined,
              minWidth: 320,
              zIndex: 9999,
              backgroundColor: resolvedTheme === 'dark' ? '#1e293b' : '#ffffff',
              borderColor: resolvedTheme === 'dark' ? '#334155' : '#e5e7eb',
              boxShadow: resolvedTheme === 'dark'
                ? '0 10px 40px rgba(0,0,0,.4), 0 2px 8px rgba(0,0,0,.3)'
                : '0 10px 40px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.08)',
              borderRadius: 16,
              padding: '16px 12px',
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto' as const,
            }}
          >
            {apps.length === 0 && (
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: resolvedTheme === 'dark' ? '#64748b' : '#94a3b8', padding: '8px 0' }}>
                Loading apps…
              </p>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
              {apps.map((app, i) => {
                const colors = colorMap[app.color] ?? fallbackColors;
                return (
                  <motion.a
                    key={app.slug}
                    href={app.url}
                    onClick={() => { trackEvent("app_switch", { app: app.slug }); setOpen(false); }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex flex-col items-center gap-1.5 rounded-xl transition-colors group"
                    style={{
                      padding: '12px 6px',
                      textDecoration: 'none',
                      display: 'flex',
                      cursor: 'pointer',
                    }}
                    whileHover={{ backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                  >
                    <span className={cn("flex items-center justify-center rounded-full transition-transform group-hover:scale-110", colors.bg, colors.text)} style={{ width: 44, height: 44 }}>
                      {iconMap[app.icon] || <Code className="h-5 w-5" />}
                    </span>
                    <span style={{ fontSize: '0.72rem', lineHeight: 1.2, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80, color: resolvedTheme === 'dark' ? '#cbd5e1' : '#334155' }}>{app.name}</span>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
