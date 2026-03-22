"use client";

import React from "react";
import {
  GraduationCap,
  Briefcase,
  Sparkles,
  Wrench,
  Users,
  Globe,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../utils/cn";
import { getUrl } from "../utils/domains";
import { trackEvent } from "../utils/analytics";
import { motion } from "framer-motion";

export interface EcosystemApp {
  name: string;
  slug: string;
  description: string;
  icon: LucideIcon;
  color: string;
  stats?: string;
}

const defaultApps: EcosystemApp[] = [
  {
    name: "Academy",
    slug: "academy",
    description: "Expert-led courses from beginner to advanced with certificates.",
    icon: GraduationCap,
    color: "from-blue-500 to-blue-600",
    stats: "500+ Courses",
  },
  {
    name: "Jobs",
    slug: "jobs",
    description: "Africa-focused tech jobs — remote, hybrid, and on-site.",
    icon: Briefcase,
    color: "from-amber-500 to-amber-600",
    stats: "50K+ Listings",
  },
  {
    name: "Spaces",
    slug: "spaces",
    description: "Community forums, discussions, and project showcases.",
    icon: Users,
    color: "from-teal-500 to-teal-600",
    stats: "10K+ Members",
  },
  {
    name: "PromptGist",
    slug: "promptgist",
    description: "AI prompt marketplace — browse, sell, and share prompts.",
    icon: Sparkles,
    color: "from-purple-500 to-purple-600",
    stats: "1K+ Prompts",
  },
  {
    name: "Tools",
    slug: "tools",
    description: "Browser-based developer utilities — JSON, regex, Base64 and more.",
    icon: Wrench,
    color: "from-pink-500 to-pink-600",
    stats: "20+ Tools",
  },
  {
    name: "Portal",
    slug: "portal",
    description: "API marketplace — subscribe, get keys, and ship in minutes.",
    icon: Globe,
    color: "from-violet-500 to-violet-600",
    stats: "Production APIs",
  },
  {
    name: "Places",
    slug: "places",
    description: "Discover businesses, hospitals, schools & services across Africa.",
    icon: MapPin,
    color: "from-sky-500 to-sky-600",
    stats: "500K+ Places",
  },
];

interface EcosystemGridProps {
  apps?: EcosystemApp[];
  title?: string;
  subtitle?: string;
}

export function EcosystemGrid({
  apps = defaultApps,
  title = "Everything You Need to Build",
  subtitle = "Seven products. One platform. From learning to launching — the Africoders ecosystem has you covered.",
}: EcosystemGridProps) {
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-4 py-1.5 text-[13px] font-semibold text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200/80 dark:ring-emerald-500/20 mb-4">
            ECOSYSTEM
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {apps.map((app, i) => {
            const Icon = app.icon;
            return (
              <motion.a
                key={app.slug}
                href={getUrl(app.slug)}
                onClick={() => trackEvent("ecosystem_click", { app: app.slug, source: "grid" })}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className={cn(
                  "group relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900",
                  "p-4 sm:p-5 transition-all duration-300",
                  "hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5",
                  "hover:border-gray-300 dark:hover:border-gray-700"
                )}
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-3",
                    "transition-transform duration-300 group-hover:scale-110",
                    app.color
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                  {app.name}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                  {app.description}
                </p>
                {app.stats && (
                  <span className="inline-block mt-2.5 text-[11px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {app.stats}
                  </span>
                )}
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
