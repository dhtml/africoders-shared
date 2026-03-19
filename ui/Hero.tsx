"use client";

import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "../utils/cn";
import { motion } from "framer-motion";

interface HeroProps {
  badge?: string;
  title: string;
  highlight?: string;
  description: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  children?: React.ReactNode;
  gradient?: string;
  align?: "center" | "left";
}

export function Hero({ badge, title, highlight, description, primaryAction, secondaryAction, children, gradient, align = "center" }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-black min-h-[70vh] flex items-center">
      {/* Background — animated mesh gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={cn(
          "absolute -top-1/2 left-1/2 -translate-x-1/2 h-[120%] w-[120%] opacity-30 dark:opacity-20 blur-[100px] animate-[spin_25s_linear_infinite]",
          gradient || "bg-[conic-gradient(from_0deg,#10b981,#06b6d4,#8b5cf6,#f43f5e,#f59e0b,#10b981)]"
        )} />
        {/* Grain overlay */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
      </div>

      <div className={cn("relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-36", align === "center" ? "text-center" : "")}>
        <div className={cn("max-w-3xl", align === "center" ? "mx-auto" : "")}>
          {badge && (
            <motion.div
              initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.1 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 dark:bg-white/5 px-4 py-1.5 text-[13px] font-medium text-gray-700 dark:text-gray-300 ring-1 ring-gray-200/80 dark:ring-white/10 mb-8 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                {badge}
              </span>
            </motion.div>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-[-0.03em] leading-[1.05]"
          >
            {title}{" "}
            {highlight && (
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-300">
                {highlight}
              </span>
            )}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className={cn("mt-6 text-lg leading-relaxed text-gray-500 dark:text-gray-400", align === "center" ? "max-w-2xl mx-auto" : "max-w-xl")}
          >
            {description}
          </motion.p>
          {(primaryAction || secondaryAction) && (
            <motion.div
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className={cn("mt-10 flex flex-col sm:flex-row gap-3", align === "center" ? "justify-center" : "")}
            >
              {primaryAction && (
                <a
                  href={primaryAction.href}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 dark:bg-white px-7 py-3.5 text-[15px] font-semibold text-white dark:text-black transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl hover:shadow-gray-900/20 dark:hover:shadow-white/20"
                >
                  {primaryAction.label}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              )}
              {secondaryAction && (
                <a
                  href={secondaryAction.href}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 px-7 py-3.5 text-[15px] font-semibold text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm"
                >
                  {secondaryAction.label}
                </a>
              )}
            </motion.div>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
