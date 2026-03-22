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
  /** Sample rate for transactions 0.0–1.0 (default: 1.0 = 100%) */
  tracesSampleRate?: number;
  /** Maximum breadcrumbs to retain (default: 50) */
  maxBreadcrumbs?: number;
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────

export interface Breadcrumb {
  timestamp: string;
  category: string;
  message: string;
  level?: "debug" | "info" | "warning" | "error" | "critical";
  data?: Record<string, unknown>;
}

// ── Transaction / Span ────────────────────────────────────────────────────────

export interface ObserveSpan {
  spanId: string;
  parentSpanId?: string;
  op: string;
  description: string;
  status: string;
  startTime: number;
  endTime?: number;
  tags: Record<string, string>;
  data: Record<string, unknown>;
  finish: (status?: string) => void;
}

export interface ObserveTransaction {
  traceId: string;
  name: string;
  op: string;
  description: string;
  status: string;
  startTime: number;
  endTime?: number;
  tags: Record<string, string>;
  spans: ObserveSpan[];
  startChild: (opts: { op: string; description?: string }) => ObserveSpan;
  setTag: (key: string, value: string) => void;
  setStatus: (status: string) => void;
  finish: (status?: string) => void;
}

// ── Event types ───────────────────────────────────────────────────────────────

interface EventBase {
  timestamp: string;
  environment: string;
  release?: string;
  platform: string;
  user?: { id: string; email?: string };
}

interface ErrorPayload extends EventBase {
  type: "error";
  error: {
    type: string;
    value: string;
    stacktrace?: {
      frames: StackFrame[];
    };
  };
  breadcrumbs?: Breadcrumb[];
  contexts?: Record<string, Record<string, unknown>>;
  tags?: Record<string, string>;
}

interface MessagePayload extends EventBase {
  type: "error";
  level: string;
  message: string;
  error: { type: string; value: string };
  breadcrumbs?: Breadcrumb[];
  tags?: Record<string, string>;
}

interface LogPayload extends EventBase {
  type: "log";
  level: "debug" | "info" | "warning" | "error" | "critical";
  message: string;
  service?: string;
  trace_id?: string;
  span_id?: string;
  attributes?: Record<string, unknown>;
}

interface MetricPayload extends EventBase {
  type: "metric";
  name: string;
  value: number;
  unit?: string;
  attributes?: Record<string, unknown>;
}

interface TransactionPayload extends EventBase {
  type: "transaction";
  trace_id: string;
  name: string;
  op: string;
  description: string;
  status: string;
  duration_ms: number;
  started_at: string;
  finished_at: string;
  tags: Record<string, string>;
  spans: Array<{
    span_id: string;
    parent_span_id?: string;
    op: string;
    description: string;
    status: string;
    duration_ms: number;
    started_at: string;
    finished_at: string;
    tags: Record<string, string>;
    data: Record<string, unknown>;
  }>;
}

type QueueItem =
  | { type: "error"; payload: ErrorPayload | MessagePayload }
  | { type: "log"; payload: LogPayload }
  | { type: "metric"; payload: MetricPayload }
  | { type: "transaction"; payload: TransactionPayload };

// ── ObserveClient ─────────────────────────────────────────────────────────────

export class ObserveClient {
  private readonly dsn: string;
  private readonly endpoint: string;
  private readonly environment: string;
  private readonly release: string | undefined;
  private readonly service: string | undefined;
  private readonly batchSize: number;
  private readonly flushInterval: number;
  private readonly tracesSampleRate: number;
  private readonly maxBreadcrumbs: number;

  private queue: QueueItem[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private userContext: { id: string; email?: string } | null = null;
  private breadcrumbs: Breadcrumb[] = [];
  private contexts: Record<string, Record<string, unknown>> = {};
  private tags: Record<string, string> = {};

  constructor(config: ObserveConfig) {
    this.dsn = config.dsn;
    this.endpoint = (config.endpoint ?? "https://api.africoders.com/api/v1/observe").replace(/\/$/, "");
    this.environment = config.environment ?? "production";
    this.release = config.release;
    this.service = config.service;
    this.batchSize = config.batchSize ?? 20;
    this.flushInterval = config.flushInterval ?? 2000;
    this.tracesSampleRate = config.tracesSampleRate ?? 1.0;
    this.maxBreadcrumbs = config.maxBreadcrumbs ?? 50;
  }

  // ── User & Context ────────────────────────────────────────────────────────

  /** Set the current user context. Attached to all subsequent events. */
  setUser(user: { id: string; email?: string } | null) {
    this.userContext = user;
  }

  /** Set a named context (e.g. "browser", "os", "device"). */
  setContext(name: string, context: Record<string, unknown>) {
    this.contexts[name] = context;
  }

  /** Set a global tag. Attached to all subsequent events. */
  setTag(key: string, value: string) {
    this.tags[key] = value;
  }

  // ── Breadcrumbs ───────────────────────────────────────────────────────────

  /** Add a breadcrumb to the trail. Oldest are dropped when max is exceeded. */
  addBreadcrumb(crumb: Omit<Breadcrumb, "timestamp">) {
    this.breadcrumbs.push({
      timestamp: new Date().toISOString(),
      ...crumb,
    });
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  // ── Error Capture ─────────────────────────────────────────────────────────

  /** Capture an Error object (called automatically by auto-capture) */
  captureException(error: Error, extra?: Record<string, unknown>) {
    this.addBreadcrumb({
      category: "error",
      message: error.message,
      level: "error",
    });
    const frames = parseStackTrace(error.stack ?? "");
    const payload: ErrorPayload = {
      type: "error",
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
      breadcrumbs: [...this.breadcrumbs],
      contexts: { ...this.contexts },
      tags: { ...this.tags },
      ...extra,
    };
    this.enqueue({ type: "error", payload });
  }

  /** @deprecated Use captureException instead. Kept for backward compat. */
  captureError(error: Error, extra?: Record<string, unknown>) {
    this.captureException(error, extra);
  }

  /** Capture a text message as an event (like Sentry.captureMessage) */
  captureMessage(message: string, level: "debug" | "info" | "warning" | "error" | "critical" = "info") {
    const payload: MessagePayload = {
      type: "error",
      timestamp: new Date().toISOString(),
      environment: this.environment,
      release: this.release,
      platform: "javascript",
      user: this.userContext ?? undefined,
      level,
      message,
      error: { type: "Message", value: message },
      breadcrumbs: [...this.breadcrumbs],
      tags: { ...this.tags },
    };
    this.enqueue({ type: "error", payload });
  }

  // ── Transaction / Span Tracing (APM) ──────────────────────────────────────

  /** Start a new transaction for performance monitoring */
  startTransaction(opts: { name: string; op?: string; description?: string }): ObserveTransaction {
    const traceId = generateId(32);
    const startTime = performance.now();

    const txn: ObserveTransaction = {
      traceId,
      name: opts.name,
      op: opts.op ?? "http",
      description: opts.description ?? "",
      status: "ok",
      startTime,
      tags: { ...this.tags },
      spans: [],

      startChild: (childOpts) => {
        const span = this.createSpan(traceId, childOpts);
        txn.spans.push(span);
        return span;
      },

      setTag: (key, value) => {
        txn.tags[key] = value;
      },

      setStatus: (status) => {
        txn.status = status;
      },

      finish: (status) => {
        if (txn.endTime !== undefined) return; // already finished
        txn.endTime = performance.now();
        if (status) txn.status = status;
        // Finish any unfinished spans
        for (const span of txn.spans) {
          if (span.endTime === undefined) span.finish("cancelled");
        }
        this.submitTransaction(txn);
      },
    };

    return txn;
  }

  private createSpan(traceId: string, opts: { op: string; description?: string }): ObserveSpan {
    const span: ObserveSpan = {
      spanId: generateId(16),
      op: opts.op,
      description: opts.description ?? "",
      status: "ok",
      startTime: performance.now(),
      tags: {},
      data: {},
      finish: (status) => {
        if (span.endTime !== undefined) return;
        span.endTime = performance.now();
        if (status) span.status = status;
      },
    };
    return span;
  }

  private submitTransaction(txn: ObserveTransaction) {
    // Apply sampling
    if (Math.random() > this.tracesSampleRate) return;

    const durationMs = (txn.endTime ?? performance.now()) - txn.startTime;
    const now = Date.now();
    const startedAt = new Date(now - durationMs).toISOString();
    const finishedAt = new Date(now).toISOString();

    const payload: TransactionPayload = {
      type: "transaction",
      timestamp: finishedAt,
      environment: this.environment,
      release: this.release,
      platform: "javascript",
      user: this.userContext ?? undefined,
      trace_id: txn.traceId,
      name: txn.name,
      op: txn.op,
      description: txn.description,
      status: txn.status,
      duration_ms: durationMs,
      started_at: startedAt,
      finished_at: finishedAt,
      tags: txn.tags,
      spans: txn.spans.map((s) => {
        const sDuration = (s.endTime ?? performance.now()) - s.startTime;
        const sStart = new Date(now - durationMs + (s.startTime - txn.startTime)).toISOString();
        const sEnd = new Date(now - durationMs + (s.startTime - txn.startTime) + sDuration).toISOString();
        return {
          span_id: s.spanId,
          parent_span_id: s.parentSpanId,
          op: s.op,
          description: s.description,
          status: s.status,
          duration_ms: sDuration,
          started_at: sStart,
          finished_at: sEnd,
          tags: s.tags,
          data: s.data,
        };
      }),
    };
    this.enqueue({ type: "transaction", payload });
  }

  // ── Structured Logging ────────────────────────────────────────────────────

  /** Capture a structured log entry */
  log(
    level: LogPayload["level"],
    message: string,
    extra?: Pick<LogPayload, "trace_id" | "span_id" | "attributes">
  ) {
    const payload: LogPayload = {
      type: "log",
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
    this.enqueue({ type: "log", payload });
  }

  /** Record a numeric metric */
  metric(
    name: string,
    value: number,
    unit?: string,
    attributes?: Record<string, unknown>
  ) {
    const payload: MetricPayload = {
      type: "metric",
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
    this.enqueue({ type: "metric", payload });
  }

  // Convenience log methods
  debug(message: string, extra?: Record<string, unknown>) { this.log("debug", message, extra as never); }
  info(message: string, extra?: Record<string, unknown>) { this.log("info", message, extra as never); }
  warn(message: string, extra?: Record<string, unknown>) { this.log("warning", message, extra as never); }
  error(message: string, extra?: Record<string, unknown>) { this.log("error", message, extra as never); }

  // ── Queue & Transport ─────────────────────────────────────────────────────

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

    // Use envelope batch endpoint for efficiency
    const payloads = items.map((item) => item.payload);
    this.send("/ingest/envelope", payloads);
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

  // ── Auto-capture ──────────────────────────────────────────────────────────

  /** Install global error + unhandled-promise-rejection handlers */
  installGlobalHandlers() {
    if (typeof window === "undefined") return;

    window.addEventListener("error", (event: ErrorEvent) => {
      this.captureException(event.error ?? new Error(event.message));
    });

    window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
      const err =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));
      this.captureException(err);
    });

    // Auto-breadcrumbs for clicks
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (!target) return;
      const desc = target.getAttribute("data-observe") || target.textContent?.slice(0, 50) || target.tagName;
      this.addBreadcrumb({ category: "ui.click", message: desc, level: "info" });
    }, { capture: true });

    // Auto-breadcrumbs for navigation
    const self = this;
    const origPushState = history.pushState;
    history.pushState = function (...args) {
      self.addBreadcrumb({ category: "navigation", message: String(args[2] ?? ""), level: "info" });
      return origPushState.apply(this, args);
    };

    // Auto-breadcrumbs for console.error
    const origConsoleError = console.error;
    console.error = function (...args) {
      self.addBreadcrumb({ category: "console", message: args.map(String).join(" "), level: "error" });
      origConsoleError.apply(console, args);
    };

    window.addEventListener("beforeunload", () => {
      this.flush();
    });
  }

  /** Instrument fetch to auto-capture HTTP breadcrumbs and timing */
  instrumentFetch() {
    if (typeof window === "undefined") return;
    const self = this;
    const origFetch = window.fetch;
    window.fetch = function (input, init) {
      const url = typeof input === "string" ? input : (input as Request).url;
      const method = init?.method ?? "GET";
      const start = performance.now();
      self.addBreadcrumb({ category: "http", message: `${method} ${url}`, level: "info" });
      return origFetch.apply(this, [input, init] as never).then(
        (res) => {
          const duration = performance.now() - start;
          self.addBreadcrumb({
            category: "http",
            message: `${method} ${url} → ${res.status}`,
            level: res.ok ? "info" : "warning",
            data: { status_code: res.status, duration_ms: Math.round(duration) },
          });
          return res;
        },
        (err) => {
          self.addBreadcrumb({
            category: "http",
            message: `${method} ${url} → failed`,
            level: "error",
            data: { error: String(err) },
          });
          throw err;
        }
      );
    };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateId(length: number): string {
  const chars = "0123456789abcdef";
  let id = "";
  const arr = new Uint8Array(length / 2);
  crypto.getRandomValues(arr);
  for (const b of arr) {
    id += chars[b >> 4] + chars[b & 0xf];
  }
  return id;
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
