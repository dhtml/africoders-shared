"use client";

import { useEffect, useState } from "react";
import { getUrl } from "../utils/domains";
import { useAuth } from "../hooks/useAuth";

interface MaintenanceState {
  enabled: boolean;
  message: string;
  end_time: string;
}

const API_BASE = getUrl("api");

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [maintenance, setMaintenance] = useState<MaintenanceState | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/auth/maintenance`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setMaintenance(d);
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, []);

  // Wait for both auth and maintenance check before rendering
  if (!checked || loading) return null;

  // Admins and authenticated users bypass maintenance mode
  const isAdmin = user?.role === "admin";
  if (!maintenance?.enabled || isAdmin) {
    return <>{children}</>;
  }

  const endTime = maintenance.end_time
    ? new Date(maintenance.end_time).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-950 via-surface-900 to-surface-800 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-600/10 ring-1 ring-primary-600/20">
          <svg className="h-10 w-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-6.836m0 0l.042-.05a12.878 12.878 0 010-3.66l-6.21-6.214a.562.562 0 00-.793.814l-.41.41m0 7.42L3.41 8.84m4.6 6.35l4.67-4.67" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Under Maintenance</h1>
        <p className="text-surface-300 text-base mb-4">
          {maintenance.message || "We're currently performing scheduled maintenance. We'll be back shortly. Thank you for your patience!"}
        </p>
        {endTime && (
          <p className="text-surface-400 text-sm">
            Expected back online: <span className="text-primary-400 font-medium">{endTime}</span>
          </p>
        )}
        <div className="mt-8 flex items-center justify-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-primary-500 animate-ping" />
          <span className="text-surface-400 text-sm">Working hard to get back online</span>
        </div>
      </div>
    </div>
  );
}
