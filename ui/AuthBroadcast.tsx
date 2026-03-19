"use client";

import { useEffect, useRef } from "react";

interface AuthBroadcastProps {
  /** JWT to write into each domain's localStorage */
  token?: string;
  /** Refresh token to write alongside the access token */
  refreshToken?: string;
  /** Pass "logout" to clear tokens on every domain */
  action?: "logout";
  /** Full base URLs to broadcast to, e.g. ["https://tools.africoders.com", ...] */
  domains: string[];
  /** Called when all iframes have responded or the timeout fires */
  onComplete: () => void;
  /** Max wait time in ms before calling onComplete anyway. Default: 6000 */
  timeoutMs?: number;
}

/**
 * AuthBroadcast — silently syncs auth state to all platform domains via hidden iframes.
 *
 * Critical implementation detail: iframes are created PROGRAMMATICALLY inside
 * useEffect, AFTER the message event listener is registered.  If we rendered
 * iframes via JSX, they would be added to the DOM before the effect runs and
 * a fast-loading /auth/sync page (e.g. same-VPS apps) could fire its
 * "auth_sync_ready" message before we're listening — causing a dropped message
 * and a 6s timeout stall.
 *
 * Protocol:
 *   iframe → parent:  { type: "auth_sync_ready" }          (page loaded, waiting)
 *   parent → iframe:  { type: "auth_sync_token", token, refresh_token }  (login)
 *                     { type: "auth_sync_clear" }                         (logout)
 *   iframe → parent:  { type: "auth_sync_done" }           (localStorage updated)
 *
 * onComplete fires once all domains confirm or the timeout elapses.
 */
export function AuthBroadcast({
  token,
  refreshToken,
  action,
  domains,
  onComplete,
  timeoutMs = 6000,
}: AuthBroadcastProps) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (domains.length === 0) {
      onCompleteRef.current();
      return;
    }

    // Map of origin → iframe element (for targeted postMessage replies)
    const iframeMap = new Map<string, HTMLIFrameElement>();
    const doneSet = new Set<string>();

    const finish = () => {
      clearTimeout(timer);
      onCompleteRef.current();
    };

    const handler = (e: MessageEvent) => {
      const matchingDomain = domains.find(
        (d) => d.replace(/\/$/, "") === e.origin.replace(/\/$/, "")
      );
      if (!matchingDomain) return;

      if (e.data?.type === "auth_sync_ready") {
        const iframe = iframeMap.get(matchingDomain);
        if (iframe?.contentWindow) {
          const msg =
            action === "logout"
              ? { type: "auth_sync_clear" }
              : { type: "auth_sync_token", token, refresh_token: refreshToken };
          iframe.contentWindow.postMessage(msg, e.origin);
        }
      } else if (e.data?.type === "auth_sync_done") {
        doneSet.add(e.origin);
        if (doneSet.size >= domains.length) finish();
      }
    };

    // *** Register listener FIRST, THEN create iframes ***
    // This eliminates the race condition where a fast iframe (same-server) posts
    // "auth_sync_ready" before our listener is attached.
    window.addEventListener("message", handler);

    const timer = setTimeout(finish, timeoutMs);

    // Programmatically create iframes now that the listener is live
    const container = document.createElement("div");
    container.setAttribute("aria-hidden", "true");
    container.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;width:0;height:0;overflow:hidden;pointer-events:none;";

    domains.forEach((domain) => {
      const iframe = document.createElement("iframe");
      iframe.src = `${domain}/auth/sync`;
      iframe.title = `auth-sync-${domain}`;
      iframe.style.cssText = "width:0;height:0;border:none;";
      iframeMap.set(domain, iframe);
      container.appendChild(iframe);
    });

    document.body.appendChild(container);

    return () => {
      window.removeEventListener("message", handler);
      clearTimeout(timer);
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount — domains/token passed at mount time are stable

  // Nothing to render — iframes are injected directly into document.body
  return null;
}
