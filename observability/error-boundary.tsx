"use client";

import React, { Component, type ReactNode } from "react";
import type { ObserveClient } from "./client";

interface Props {
  client: ObserveClient;
  fallback?: ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ObserveErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.client.captureError(error, {
      componentStack: info.componentStack ?? "",
    });
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "#ef4444",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>
            Something went wrong.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.5rem" }}>
            {this.state.error?.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1.5rem",
              background: "#1d4ed8",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
