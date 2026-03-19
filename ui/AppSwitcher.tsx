"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  GraduationCap, Code, Sparkles, Building2, Wrench,
  HeartPulse, Briefcase, LayoutGrid, Globe,
  Braces, Radio, BookOpen, Activity, MonitorDot, Users, Loader2
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "../utils/cn";
import { getDomain, getUrl } from "../utils/domains";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  name: string;
  slug: string;
  domain: string;
  icon: string;
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
};

const colorMap: Record<string, { bg: string; text: string }> = {
  "africoders":  { bg: "bg-emerald-100 dark:bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400" },
  "console":     { bg: "bg-slate-100 dark:bg-slate-500/15",     text: "text-slate-600 dark:text-slate-400" },
  "academy":     { bg: "bg-blue-100 dark:bg-blue-500/15",       text: "text-blue-600 dark:text-blue-400" },
  "jobs":        { bg: "bg-amber-100 dark:bg-amber-500/15",     text: "text-amber-600 dark:text-amber-400" },
  "noccea":      { bg: "bg-orange-100 dark:bg-orange-500/15",   text: "text-orange-600 dark:text-orange-400" },
  "kortextools": { bg: "bg-pink-100 dark:bg-pink-500/15",       text: "text-pink-600 dark:text-pink-400" },
  "afrihealthsys": { bg: "bg-red-100 dark:bg-red-500/15",       text: "text-red-600 dark:text-red-400" },
  "promptgist":  { bg: "bg-purple-100 dark:bg-purple-500/15",   text: "text-purple-600 dark:text-purple-400" },
  "spaces":      { bg: "bg-teal-100 dark:bg-teal-500/15",       text: "text-teal-600 dark:text-teal-400" },
  "portal":      { bg: "bg-violet-100 dark:bg-violet-500/15",   text: "text-violet-600 dark:text-violet-400" },
  "observe":     { bg: "bg-cyan-100 dark:bg-cyan-500/15",        text: "text-cyan-600 dark:text-cyan-400" },
};

const defaultProducts: Omit<Product, "domain">[] = [
  { name: "Africoders",    slug: "africoders",    icon: "braces" },
  { name: "Console",       slug: "console",       icon: "monitor-dot" },
  { name: "Academy",       slug: "academy",       icon: "graduation-cap" },
  { name: "Jobs",          slug: "jobs",          icon: "briefcase" },
  { name: "Noccea",        slug: "noccea",        icon: "building-2" },
  { name: "KortexTools",   slug: "kortextools",   icon: "wrench" },
  { name: "AfriHealthSys", slug: "afrihealthsys", icon: "heart-pulse" },
  { name: "PromptGist",    slug: "promptgist",    icon: "sparkles" },
  { name: "Spaces",        slug: "spaces",        icon: "users" },
  { name: "Portal",        slug: "portal",        icon: "globe" },
  { name: "Observe",       slug: "observe",       icon: "activity" },
];

export function AppSwitcher() {
  const [products] = useState<Product[]>(() =>
    defaultProducts.map((p) => ({ ...p, domain: getDomain(p.slug) }))
  );
  const [open, setOpen] = useState(false);
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  const handleSwitch = useCallback(async (targetDomain: string) => {
    setOpen(false);
    if (!isAuthenticated) {
      window.location.href = `https://${targetDomain}`;
      return;
    }
    setSwitchingTo(targetDomain);
    try {
      const res = await fetch(`${getUrl("api")}/api/v1/auth/switch/issue`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const { switch_token } = await res.json();
        window.location.href = `https://${targetDomain}/auth/sso?token=${encodeURIComponent(switch_token)}`;
        return;
      }
    } catch {
      // fall through to plain navigation
    }
    setSwitchingTo(null);
    window.location.href = `https://${targetDomain}`;
  }, [isAuthenticated]);

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
            className="absolute right-0 top-full mt-2 rounded-2xl border overflow-hidden"
            style={{
              width: 320,
              zIndex: 9999,
              backgroundColor: resolvedTheme === 'dark' ? '#1e293b' : '#ffffff',
              borderColor: resolvedTheme === 'dark' ? '#334155' : '#e5e7eb',
              boxShadow: resolvedTheme === 'dark'
                ? '0 10px 40px rgba(0,0,0,.4), 0 2px 8px rgba(0,0,0,.3)'
                : '0 10px 40px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.08)',
              borderRadius: 16,
              padding: '16px 12px',
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
              {products.map((p, i) => {
                const colors = colorMap[p.slug] || { bg: "bg-gray-100 dark:bg-gray-500/15", text: "text-gray-600 dark:text-gray-400" };
                return (
                  <motion.button
                    key={p.slug}
                    onClick={() => handleSwitch(p.domain)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex flex-col items-center gap-1.5 rounded-xl transition-colors group"
                    style={{
                      padding: '12px 6px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    whileHover={{ backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                  >
                    <span className={cn("flex items-center justify-center rounded-full transition-transform group-hover:scale-110", colors.bg, colors.text)} style={{ width: 44, height: 44 }}>
                      {switchingTo === p.domain
                        ? <Loader2 className="h-5 w-5 animate-spin" />
                        : (iconMap[p.icon] || <Code className="h-5 w-5" />)
                      }
                    </span>
                    <span style={{ fontSize: '0.72rem', lineHeight: 1.2, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 80, color: resolvedTheme === 'dark' ? '#cbd5e1' : '#334155' }}>{p.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
