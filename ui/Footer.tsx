"use client";

import React from "react";
import { Github, Twitter, MessageCircle, Send, Linkedin, Youtube } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Home",     href: "https://africoders.com" },
    { label: "API Docs", href: "https://portal.africoders.com/docs" },
    { label: "Pricing",  href: "https://tools.africoders.com/pricing" },
    { label: "Console",  href: "https://console.africoders.com" },
    { label: "Blog",     href: "https://africoders.com/blog" },
  ],
  Products: [
    { label: "Academy",      href: "https://academy.africoders.com" },
    { label: "Spaces",       href: "https://spaces.africoders.com" },
    { label: "PromptGist",   href: "https://promptgist.africoders.com" },
    { label: "KortexTools",  href: "https://tools.africoders.com" },
    { label: "Noccea",       href: "https://noccea.africoders.com" },
    { label: "AfriHealthSys",href: "https://health.africoders.com" },
  ],
  Developers: [
    { label: "API Marketplace",href: "https://portal.africoders.com/docs" },
    { label: "API Docs",       href: "https://portal.africoders.com/docs" },
    { label: "Developer Tools",href: "https://tools.africoders.com" },
    { label: "PromptGist",     href: "https://promptgist.africoders.com" },
    { label: "Open Source",    href: "https://github.com/africoders" },
    { label: "Community",      href: "https://africoders.com/community" },
  ],
  Company: [
    { label: "About",         href: "https://africoders.com/about" },
    { label: "Careers",       href: "https://africoders.com/careers" },
    { label: "Documentation", href: "https://portal.africoders.com" },
    { label: "System Status", href: "https://portal.africoders.com/status" },
    { label: "Privacy",       href: "https://africoders.com/privacy" },
    { label: "Terms",         href: "https://africoders.com/terms" },
  ],
};

const socialLinks = [
  { label: "X", href: "https://x.com/africoders", icon: <Twitter className="h-4 w-4" /> },
  { label: "GitHub", href: "https://github.com/africoders", icon: <Github className="h-4 w-4" /> },
  { label: "Discord", href: "https://discord.gg/brV4QuHUQS", icon: <MessageCircle className="h-4 w-4" /> },
  { label: "Telegram", href: "https://t.me/africodershub", icon: <Send className="h-4 w-4" /> },
  { label: "LinkedIn", href: "https://linkedin.com/company/africoders", icon: <Linkedin className="h-4 w-4" /> },
  { label: "YouTube", href: "https://youtube.com/@africoders", icon: <Youtube className="h-4 w-4" /> },
];

export function Footer() {
  return (
    <footer className="mt-auto" style={{ backgroundColor: "#1a1f2e" }}>
      <div className="mx-auto px-3 lg:px-4" style={{ maxWidth: "1400px" }}>
        {/* Main grid */}
        <div className="pt-14 pb-6">
          {/* Desktop layout: 5 columns */}
          <div className="hidden lg:grid mb-6" style={{ gridTemplateColumns: "3fr 2fr 2fr 2fr 2fr", gap: "1.5rem" }}>
            {/* Brand */}
            <div>
              <a href="https://africoders.com" className="inline-flex items-center gap-2 mb-3">
                <span className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">A</span>
                <span className="text-base font-bold tracking-tight">
                  <span className="text-white">afri</span>
                  <span className="text-emerald-500">coders</span>
                </span>
              </a>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#9ca3af", maxWidth: "260px" }}>
                Africa&apos;s premier developer community. Learn, build, and grow with thousands of developers across the continent.
              </p>
              <div className="flex gap-4 flex-wrap">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors"
                    style={{ color: "#9ca3af" }}
                    aria-label={link.label}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h6 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#e5e7eb" }}>{title}</h6>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label + link.href}>
                      <a
                        href={link.href}
                        className="text-sm transition-colors"
                        style={{ color: "#9ca3af" }}
                        {...(link.href.startsWith("https://github") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mobile/Tablet layout: 2-col grid like Bootstrap col-6 */}
          <div className="lg:hidden">
            <div className="mb-6">
              <a href="https://africoders.com" className="inline-flex items-center gap-2 mb-3">
                <span className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">A</span>
                <span className="text-base font-bold tracking-tight">
                  <span className="text-white">afri</span>
                  <span className="text-emerald-500">coders</span>
                </span>
              </a>
              <p className="text-sm leading-relaxed mb-3 hidden md:block" style={{ color: "#9ca3af", maxWidth: "260px" }}>
                Africa&apos;s premier developer community. Learn, build, and grow with thousands of developers across the continent.
              </p>
              <div className="flex gap-4 flex-wrap">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#9ca3af" }}
                    aria-label={link.label}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
            <div className="mb-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              {Object.entries(footerLinks).map(([title, links]) => (
                <div key={title}>
                  <h6 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#e5e7eb" }}>{title}</h6>
                  <ul className="space-y-2">
                    {links.map((link) => (
                      <li key={link.label + link.href}>
                        <a href={link.href} className="text-sm" style={{ color: "#9ca3af" }}>
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr style={{ borderColor: "#2d3548", borderTopWidth: "1px" }} className="border-0" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-2 py-5 md:flex-row">
          <p className="text-sm mb-0" style={{ color: "#6b7280" }}>&copy; {new Date().getFullYear()} Africoders. All rights reserved.</p>
          <p className="text-sm mb-0" style={{ color: "#6b7280" }}>Built with <span className="text-emerald-500">💚</span> for African developers</p>
        </div>
      </div>
    </footer>
  );
}
