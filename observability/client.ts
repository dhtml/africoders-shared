"use client";

export interface ObserveConfig {
  /** Project DSN — get this from Observe dashboard → Project Settings */
  dsn: string;
  /** Application environment (default: "production") */
  environment?: string;
  /** Application release / git sha */
  release?: string;
  /** Service name for log events */
  service?: string;
  /** Override ingest endpoint (default: https://api.africoders.com/api/v1/observe) */
  endpoint?: string;
  /** Maximum events in the batch queue before flushing (default: 20) */
  batchSize?: number;
  /** Milliseconds to wait before flushing the batch (default: 2000) */
  flushInterval?: number;
}

interface EventBase {
  timestamp: string;
  environment: string;
  release?: string;
  platform: string;
  user?: { id: string; email?: string };
}

interface ErrorPayload extends EventBase {
  error: {
    type: string;
    value: string;
    stacktrace?: {
      frames: Array<{
        filename: string;
        lineno: number;
        colno: number;
        function: string;
        in_app: boolean;
      }>;
    };
  };
}

interface LogPayload extends EventBase {
  level: "debug" | "info" | "warning" | "error" | "critical";
  message: string;
  service?: string;
  trace_id?: string;
  span_id?: string;
  attributes?: Record<string, unknown>;
}

interface MetricPayload extends EventBase {
  name: string;
  value: number;
  unit?: string;
  attributes?: Record<string, unknown>;
}

type QueueItem =
  | { type: "error"; path: string; payload: ErrorPayload }
  | { type: "log"; path: string; payload: LogPayload }
  | { type: "metric"; path: string; payload: MetricPayload };

export class ObserveClient {
  private readonly dsn: string;
  private readonly endpoint: string;
  private readonly environment: string;
  private readonly release: string | undefined;
  private readonly service: string | undefined;
  private readonly batchSize: number;
  private readonly flushInterval: number;

  private queue: QueueItem[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private userContext: { id: string; email?: string } | null = null;

  constructor(config: ObserveConfig) {
    this.dsn = config.dsn;
    this.endpoint = (config.endpoint ?? "https://api.africoders.com/api/v1/observe").replace(/\/$/, "");
    this.environment = config.environment ?? "production";
    this.release = config.release;
    this.service = config.service;
    this.batchSize = config.batchSize ?? 20;
    this.flushInterval = config.flushInterval ?? 2000;
  }

  /** Call once after user authenticates */
  setUser(user: { id: string; email?: string } | null) {
    this.userContext = user;
  }

  /** Capture an Error object (called automatically by auto-capture) */
  captureError(error: Error, extra?: Record<string, unknown>) {
    const frames = parseStackTrace(error.stack ?? "");
    const payload: ErrorPayload = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      release: this.release,
      platform: "javascript",
      user: this.userContext ?? undefined,
      error: {
        type: error.name,
        value: error.message,
        stacktrace: frames.length ? { frames } : undefined,
      },
      ...extra,
    };
    this.enqueue({ type: "error", path: "/ingest/error", payload });
  }

  /** Capture a structured log entry */
  log(
    level: LogPayload["level"],
    message: string,
    extra?: Pick<LogPayload, "trace_id" | "span_id" | "attributes">
  ) {
    const payload: LogPayload = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      release: this.release,
      platform: "javascript",
      user: this.userContext ?? undefined,
      level,
      message,
      service: this.service,
      ...extra,
    };
    this.enqueue({ type: "log", path: "/ingest/log", payload });
  }

  /** Record a numeric metric */
  metric(
    name: string,
    value: number,
    unit?: string,
    attributes?: Record<string, unknown>
  ) {
    const payload: MetricPayload = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      release: this.release,
      platform: "javascript",
      user: this.userContext ?? undefined,
      name,
      value,
      unit,
      attributes,
    };
    this.enqueue({ type: "metric", path: "/ingest/metric", payload });
  }

  // Convenience log methods
  debug(message: string, extra?: Record<string, unknown>) {
    this.log("debug", message, extra);
  }
  info(message: string, extra?: Record<string, unknown>) {
    this.log("info", message, extra);
  }
  warn(message: string, extra?: Record<string, unknown>) {
    this.log("warning", message, extra);
  }
  error(message: string, extra?: Record<string, unknown>) {
    this.log("error", message, extra);
  }

  private enqueue(item: QueueItem) {
    this.queue.push(item);
    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.flushInterval);
    }
  }

  /** Flush the event queue — called automatically; also call on page unload */
  flush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.queue.length === 0) return;
    const items = this.queue.splice(0);

    // Group items by path so we do one request per endpoint type
    const byPath = new Map<string, QueueItem[]>();
    for (const item of items) {
      const list = byPath.get(item.path) ?? [];
      list.push(item);
      byPath.set(item.path, list);
    }

    for (const [path, batch] of byPath) {
      for (const item of batch) {
        this.send(path, item.payload);
      }
    }
  }

  private send(path: string, payload: unknown) {
    const url = `${this.endpoint}${path}`;
    const body = JSON.stringify(payload);
    const headers = { "Content-Type": "application/json", "X-DSN": this.dsn };

    // Use keepalive fetch so the request survives page navigation
    fetch(url, {
      method: "POST",
      headers,
      body,
      credentials: "omit",
      keepalive: true,
    }).catch(() => {
      // Silently discard — observability should never break the app
    });
  }

  /** Install global error + unhandled-promise-rejection handlers */
  installGlobalHandlers() {
    if (typeof window === "undefined") return;

    window.addEventListener("error", (event: ErrorEvent) => {
      this.captureError(event.error ?? new Error(event.message));
    });

    window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
      const err =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));
      this.captureError(err);
    });

    window.addEventListener("beforeunload", () => {
      this.flush();
    });
  }
}

// ── Stack trace parser ────────────────────────────────────────────────────────

interface StackFrame {
  filename: string;
  lineno: number;
  colno: number;
  function: string;
  in_app: boolean;
}

function parseStackTrace(stack: string): StackFrame[] {
  const frames: StackFrame[] = [];
  const lines = stack.split("\n");
  // Parse V8/Node/browser stack format: "  at FnName (file.js:10:5)"
  const re = /^\s*at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?$/;
  for (const line of lines.slice(1)) {
    const m = re.exec(line);
    if (!m) continue;
    const [, fn = "<anonymous>", filename, lineno, colno] = m;
    frames.push({
      filename,
      lineno: Number(lineno),
      colno: Number(colno),
      function: fn,
      in_app: !filename.includes("node_modules"),
    });
  }
  return frames;
}
