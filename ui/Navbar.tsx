"use client";

import React from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AppSwitcher } from "./AppSwitcher";
import { Bell, Search, User, Menu, X, Sun, Moon, LogIn, LogOut, ChevronDown, LayoutDashboard, Wallet, Key, Settings, Shield } from "lucide-react";
import { cn } from "../utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { hasMinRole } from "../utils/roles";
import { getUrl } from "../utils/domains";

interface ProfileMenuItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface NavbarProps {
  appName: string;
  appIcon?: React.ReactNode;
  links?: { href: string; label: string; active?: boolean }[];
  showSearch?: boolean;
  accent?: string;
  loginHref?: string;
  adminHref?: string;
  profileMenuItems?: ProfileMenuItem[];
}

export function Navbar({ appName, appIcon, links = [], showSearch = true, accent, loginHref = "/login", adminHref = "/admin", profileMenuItems = [] }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  React.useEffect(() => { setMounted(true); }, []);
  React.useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isDark = theme === "dark";

  return (
    <>
      <nav className="sticky top-0 z-50 transition-all duration-500 border-b border-gray-200/60 bg-white/95 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:bg-gray-950/95 dark:border-white/5 dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-5">
              <button
                className="lg:hidden -ml-1 p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-xl hover:bg-gray-100/80 dark:hover:bg-white/5 transition-all"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mobileOpen ? "close" : "open"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </motion.span>
                </AnimatePresence>
              </button>

              <a href="/" className="flex items-center gap-2.5 group">
                {appIcon || (
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg",
                    accent || "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25"
                  )}>
                    {appName.charAt(0)}
                  </div>
                )}
                <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">{appName}</span>
              </a>

              <div className="hidden lg:flex items-center gap-0.5 ml-1">
                {links.map((link) => {
                  const isLocal = link.href.startsWith("/");
                  const isActive = isLocal
                    ? (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href))
                    : !!link.active;
                  const Tag = isLocal ? Link : "a";
                  return (
                    <Tag
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "relative px-3 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200",
                        isActive
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      )}
                    >
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute inset-0 rounded-lg bg-gray-100 dark:bg-white/10 -z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                        />
                      )}
                    </Tag>
                  );
                })}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              {showSearch && (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="hidden sm:flex items-center gap-2 h-8 rounded-lg border border-gray-200/80 bg-gray-50/80 px-3 text-[13px] text-gray-400 hover:border-gray-300 hover:bg-white transition-all dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-white/20 min-w-[180px]"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Search...</span>
                  <kbd className="ml-auto hidden lg:inline-flex h-[18px] items-center gap-0.5 rounded border border-gray-200/80 bg-white px-1 text-[10px] font-medium text-gray-400 dark:border-white/10 dark:bg-white/5">⌘K</kbd>
                </button>
              )}
              {showSearch && (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="sm:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100/80 dark:hover:bg-white/5"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </button>
              )}

              {/* Dark/Light Mode Toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 dark:hover:bg-white/5 dark:hover:text-white transition-all"
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={isDark ? "moon" : "sun"}
                      initial={{ scale: 0, rotate: -180, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      exit={{ scale: 0, rotate: 180, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="block"
                    >
                      {isDark ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
                    </motion.span>
                  </AnimatePresence>
                </button>
              )}

              {isAuthenticated && (
                <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100/80 dark:hover:bg-white/5 dark:hover:text-white transition-all" aria-label="Notifications">
                  <Bell className="h-[18px] w-[18px]" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-black animate-pulse" />
                </button>
              )}

              <AppSwitcher />

              {/* Auth: Login or User Menu */}
              {!authLoading && !isAuthenticated && (
                <a
                  href={loginHref}
                  className="ml-1 h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-1.5 text-white text-[13px] font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Login</span>
                </a>
              )}
              {!authLoading && isAuthenticated && user && (
                <div className="relative ml-1" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg hover:bg-gray-100/80 dark:hover:bg-white/5 transition-all"
                  >
                    <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="hidden sm:inline text-[13px] font-medium text-gray-700 dark:text-gray-300">
                      Me
                    </span>
                    <ChevronDown className="h-3 w-3 text-gray-400" />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-white dark:bg-gray-900 shadow-xl shadow-black/10 border border-gray-200/80 dark:border-white/10 overflow-hidden z-50"
                      >
                        {/* User info */}
                        <div className="px-3 py-2.5 border-b border-gray-100 dark:border-white/5">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                          {user.username && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
                          )}
                        </div>

                        {/* Primary links */}
                        <div className="py-1">
                          {user.username && (
                            <a href={getUrl("identity", `/@${user.username}`)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                              <User className="h-4 w-4 text-gray-400" />
                              My Profile
                            </a>
                          )}
                          {hasMinRole(user?.role, "admin") && (
                            <a href={adminHref} className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                              <LayoutDashboard className="h-4 w-4 text-gray-400" />
                              Dashboard
                            </a>
                          )}
                          <a href={getUrl("africoders", "/wallet")} className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <Wallet className="h-4 w-4 text-gray-400" />
                            Wallet
                          </a>
                          <a href={getUrl("portal", "/keys")} className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <Key className="h-4 w-4 text-gray-400" />
                            API Keys
                          </a>
                        </div>

                        {/* App-specific extras */}
                        {profileMenuItems.length > 0 && (
                          <>
                            <div className="border-t border-gray-100 dark:border-white/5" />
                            <div className="py-1">
                              {profileMenuItems.map((item) => (
                                <a key={item.href} href={item.href} className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                  {item.icon || <span className="h-4 w-4" />}
                                  {item.label}
                                </a>
                              ))}
                            </div>
                          </>
                        )}

                        {/* Settings */}
                        <div className="border-t border-gray-100 dark:border-white/5" />
                        <div className="py-1">
                          <a href={getUrl("identity", "/settings/profile")} className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <Settings className="h-4 w-4 text-gray-400" />
                            Settings
                          </a>
                          <a href={getUrl("identity", "/settings/security")} className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <Shield className="h-4 w-4 text-gray-400" />
                            Security
                          </a>
                        </div>

                        {/* Sign out */}
                        <div className="border-t border-gray-100 dark:border-white/5" />
                        <div className="py-1">
                          <button
                            onClick={async () => {
                              setUserMenuOpen(false);
                              await logout();
                              window.location.href = "/";
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full text-left"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" as const }}
              className="lg:hidden overflow-hidden border-t border-gray-200/50 dark:border-white/5 bg-white/95 dark:bg-black/95 backdrop-blur-xl"
            >
              <div className="px-4 py-3 space-y-0.5">
                {links.map((link, i) => {
                  const isLocal = link.href.startsWith("/");
                  const isActive = isLocal
                    ? (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href))
                    : !!link.active;
                  return (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all",
                        isActive
                          ? "text-gray-900 bg-gray-100 dark:text-white dark:bg-white/10"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5"
                      )}
                    >
                      {link.label}
                    </motion.a>
                  );
                })}
                {/* Mobile auth */}
                {!authLoading && !isAuthenticated && (
                  <motion.a
                    href={loginHref}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: links.length * 0.05 }}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10 transition-all"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </motion.a>
                )}
                {!authLoading && isAuthenticated && user && (
                  <>
                    {/* User info */}
                    <div className="flex items-center gap-3 px-3 py-2.5 border-t border-gray-200/50 dark:border-white/5 mt-2 pt-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                        {user.username && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
                        )}
                      </div>
                    </div>

                    {/* Primary links */}
                    {user.username && (
                      <a href={getUrl("identity", `/@${user.username}`)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-all">
                        <User className="h-4 w-4" />
                        My Profile
                      </a>
                    )}
                    {hasMinRole(user?.role, "admin") && (
                      <a href={adminHref} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-all">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </a>
                    )}
                    <a href={getUrl("africoders", "/wallet")} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-all">
                      <Wallet className="h-4 w-4" />
                      Wallet
                    </a>
                    <a href={getUrl("portal", "/keys")} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-all">
                      <Key className="h-4 w-4" />
                      API Keys
                    </a>

                    {/* App-specific extras */}
                    {profileMenuItems.length > 0 && (
                      <div className="border-t border-gray-200/50 dark:border-white/5 my-1" />
                    )}
                    {profileMenuItems.map((item) => (
                      <a key={item.href} href={item.href} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-all">
                        {item.icon || <span className="h-4 w-4" />}
                        {item.label}
                      </a>
                    ))}

                    {/* Settings */}
                    <div className="border-t border-gray-200/50 dark:border-white/5 my-1" />
                    <a href={getUrl("identity", "/settings/profile")} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-all">
                      <Settings className="h-4 w-4" />
                      Settings
                    </a>
                    <a href={getUrl("identity", "/settings/security")} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-all">
                      <Shield className="h-4 w-4" />
                      Security
                    </a>

                    {/* Sign out */}
                    <div className="border-t border-gray-200/50 dark:border-white/5 my-1" />
                    <button
                      onClick={async () => { await logout(); window.location.href = "/"; }}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-all w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" as const }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[61] w-full max-w-lg"
            >
              <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl shadow-black/20 border border-gray-200/80 dark:border-white/10 overflow-hidden">
                <div className="flex items-center gap-3 px-4 border-b border-gray-100 dark:border-white/5">
                  <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <input
                    autoFocus
                    type="search"
                    placeholder="Search across the platform..."
                    className="flex-1 h-12 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
                  />
                  <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-gray-200 bg-gray-50 px-1.5 text-[10px] text-gray-400 dark:border-white/10 dark:bg-white/5">ESC</kbd>
                </div>
                <div className="p-6 text-sm text-gray-400 text-center">Start typing to search...</div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
