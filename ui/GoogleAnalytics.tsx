"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GA_ID = "G-FNHHKRVKQX";

const CROSS_DOMAINS = [
  "africoders.com",
  "academy.africoders.com",
  "console.africoders.com",
  "jobs.africoders.com",
  "spaces.africoders.com",
  "portal.africoders.com",
  "promptgist.africoders.com",
  "crm.africoders.com",
  "tools.africoders.com",
  "health.africoders.com",
  "identity.africoders.com",
  "observe.africoders.com",
  "places.africoders.com",
];

interface GoogleAnalyticsProps {
  /** Identifies which platform module is sending events (e.g. "core", "academy", "jobs") */
  module?: string;
}

export function GoogleAnalytics({ module = "core" }: GoogleAnalyticsProps) {
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    setIsProduction(!window.location.hostname.endsWith(".local"));
  }, []);

  if (!isProduction) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            linker: { domains: ${JSON.stringify(CROSS_DOMAINS)} }
          });
          gtag('event', 'page_view', { platform_module: '${module}' });
        `}
      </Script>
    </>
  );
}
