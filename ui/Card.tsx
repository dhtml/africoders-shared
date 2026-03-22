"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";
import { motion, type HTMLMotionProps } from "framer-motion";

// ── Card ──────────────────────────────────────────────────────────────
const cardVariants = cva(
  "rounded-2xl border bg-white dark:bg-gray-900 dark:border-gray-800 transition-all duration-300",
  {
    variants: {
      hover: { true: "hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 hover:border-gray-300 dark:hover:border-gray-700" },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      variant: {
        default: "border-gray-200",
        ghost: "border-transparent bg-gray-50 dark:bg-gray-800/50",
        gradient: "border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-sm",
      },
    },
    defaultVariants: { hover: false, padding: "md", variant: "default" },
  }
);

interface CardProps extends VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, hover, padding, variant }: CardProps) {
  return (
    <div className={cn(cardVariants({ hover, padding, variant }), className)}>
      {children}
    </div>
  );
}

// ── AnimatedCard ──────────────────────────────────────────────────────
interface AnimatedCardProps extends CardProps {
  delay?: number;
}

export function AnimatedCard({ children, className, hover = true, padding, variant, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn(cardVariants({ hover, padding, variant }), className)}
    >
      {children}
    </motion.div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  icon?: React.ReactNode;
  accent?: string;
}

export function StatCard({ label, value, change, trend, icon, accent }: StatCardProps) {
  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</p>
          {change && (
            <div className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              trend === "up" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
            )}>
              {trend === "up" ? "↑" : "↓"} {change}
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            accent || "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          )}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      {icon && <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800">{icon}</div>}
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-gray-500 dark:text-gray-400">{description}</p>
      {action && (
        <a href={action.href} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md">
          {action.label}
        </a>
      )}
    </motion.div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
        warning: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
        danger: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
        info: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
        purple: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
        outline: "border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400",
      },
      size: {
        sm: "px-2 py-0.5",
        md: "px-2.5 py-1",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ children, variant, size, className, dot }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

// ── Button ────────────────────────────────────────────────────────────
const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md focus-visible:ring-emerald-500 active:scale-[0.98]",
        secondary: "border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 focus-visible:ring-gray-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white",
        danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500",
        gradient: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:shadow-lg hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98]",
      },
      size: {
        sm: "h-8 px-3 text-xs gap-1.5",
        md: "h-10 px-4 text-sm gap-2",
        lg: "h-12 px-6 text-base gap-2.5",
        xl: "h-14 px-8 text-lg gap-3",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  href?: string;
  children?: React.ReactNode;
  loading?: boolean;
}

export function Button({ children, variant, size, className, href, loading, disabled, ...props }: ButtonProps) {
  const cls = cn(buttonVariants({ variant, size }), className);
  if (href) {
    return <a href={href} className={cls}>{children}</a>;
  }
  return (
    <button className={cls} disabled={disabled || loading} {...props}>
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────
interface AvatarProps {
  src?: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  ring?: boolean;
}

const avatarSizes = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export function Avatar({ src, name, size = "md", ring }: AvatarProps) {
  const base = cn(
    "rounded-full flex-shrink-0",
    avatarSizes[size],
    ring && "ring-2 ring-white dark:ring-gray-900"
  );
  if (src) {
    return <img src={src} alt={name} className={cn(base, "object-cover")} />;
  }
  return (
    <div className={cn(base, "bg-gradient-to-br from-emerald-400 to-teal-600 text-white font-semibold flex items-center justify-center")}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ── AvatarGroup ───────────────────────────────────────────────────────
interface AvatarGroupProps {
  users: { name: string; src?: string }[];
  max?: number;
  size?: "sm" | "md";
}

export function AvatarGroup({ users, max = 4, size = "sm" }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const remaining = users.length - max;
  return (
    <div className="flex -space-x-2">
      {visible.map((u, i) => (
        <Avatar key={i} name={u.name} src={u.src} size={size} ring />
      ))}
      {remaining > 0 && (
        <div className={cn(
          "rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold flex items-center justify-center ring-2 ring-white dark:ring-gray-900",
          avatarSizes[size]
        )}>
          +{remaining}
        </div>
      )}
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────
interface TabsProps {
  tabs: { key: string; label: string; count?: number }[];
  active: string;
  onChange: (key: string) => void;
  accent?: string;
}

export function Tabs({ tabs, active, onChange, accent }: TabsProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <nav className="flex gap-1 -mb-px" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active === tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative px-4 py-3 text-sm font-medium transition-colors",
              active === tab.key
                ? `text-emerald-600 dark:text-emerald-400`
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            )}
          >
            <span className="flex items-center gap-2">
              {tab.label}
              {tab.count !== undefined && (
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  active === tab.key ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                )}>
                  {tab.count}
                </span>
              )}
            </span>
            {active === tab.key && (
              <motion.div
                layoutId="tab-indicator"
                className={cn("absolute inset-x-0 -bottom-px h-0.5 rounded-full", accent || "bg-emerald-600")}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800", className)} />;
}

// ── Input ─────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <div className="relative">
        {icon && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">{icon}</div>}
        <input
          id={inputId}
          className={cn(
            "flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm transition-colors",
            "placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
            "dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-emerald-500",
            icon && "pl-10",
            error && "border-red-300 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────
interface SectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Section({ children, className, title, subtitle, action }: SectionProps) {
  return (
    <section className={cn("py-16 lg:py-24", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="max-w-2xl">
              {title && <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{title}</h2>}
              {subtitle && <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
            {action}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}
