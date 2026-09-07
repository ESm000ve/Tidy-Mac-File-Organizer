import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import { WarningCircle as AlertCircle, ArrowLeftRight as ArrowRightLeft, Check, ChevronRight, CircleDashed, Copy, Pencil, Scroll as ScrollText, Command as Terminal, X } from "./icons";
// ─── Types ────────────────────────────────────────────────────────────────────
export type RunState = "idle" | "scanning" | "running" | "completed" | "error";

export interface RunMetrics {
  moved: number;
  renamed: number;
  duplicates: number;
  errors: number;
  timestamp: Date | null;
  destPath?: string;
  operations?: any[];
}

interface StatusBarProps {
  runState: RunState;
  metrics: RunMetrics;
  logEvents?: { level: "info" | "warn" | "error" | "success"; message: string; time: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTimestamp(date: Date): string {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  if (date.toDateString() === now.toDateString()) return `Today at ${time}`;
  if (date.toDateString() === yesterday.toDateString())
    return `Yesterday at ${time}`;
  return (
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    ` at ${time}`
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Single metric chip */
function MetricChip({
  icon,
  value,
  label,
  colorClass,
  emphasized,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  colorClass: string;
  emphasized?: boolean;
}) {
  return (
    <div
      aria-label={`${value} ${label}`}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] transition-colors ${emphasized
        ? "bg-red-500/10"
        : "bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
        }`}
    >
      <span className={`flex-shrink-0 ${colorClass}`} aria-hidden="true">{icon}</span>
      <span
        aria-hidden="true"
        className={`text-[13px] tabular-nums ${emphasized ? "text-red-500 dark:text-red-400" : "text-foreground/80 dark:text-white/65"
          }`}
      >
        {value.toLocaleString()}
      </span>
      <span
        aria-hidden="true"
        className={`text-[13px] ${emphasized ? "text-red-500/70 dark:text-red-400/70" : "text-foreground/60 dark:text-white/50"
          }`}
      >
        {label}
      </span>
    </div>
  );
}

/** Thin vertical divider between metrics */
function MetricDivider() {
  return (
    <div className="w-px h-3.5 bg-black/[0.08] dark:bg-white/[0.08] mx-0.5 shrink-0" aria-hidden="true" />
  );
}

/** Status indicator dot/icon */
function StatusDot({ runState }: { runState: RunState }) {
  const statusLabel =
    runState === "running" ? "Running" :
      runState === "completed" ? "Completed" :
        runState === "error" ? "Error" : "Idle";

  if (runState === "running") {
    return (
      <div className="relative w-3 h-3 flex items-center justify-center shrink-0" role="status" aria-label={statusLabel}>
        <CircleDashed className="w-3 h-3 text-[var(--system-blue)] animate-spin" aria-hidden="true" />
      </div>
    );
  }

  if (runState === "completed") {
    return (
      <div className="flex items-center justify-center w-3 h-3 shrink-0 rounded-full bg-[var(--system-green)]" role="status" aria-label={statusLabel}>
        <Check className="w-2 h-2 text-white" aria-hidden="true" />
      </div>
    );
  }

  if (runState === "error") {
    return (
      <div className="flex items-center justify-center w-3 h-3 shrink-0 rounded-full bg-[var(--system-red)]" role="status" aria-label={statusLabel}>
        <X className="w-2 h-2 text-white" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={statusLabel}
      className="w-2 h-2 rounded-full shrink-0 transition-colors duration-500 bg-black/10 dark:bg-white/20"
    />
  );
}

// ─── Log Drawer ───────────────────────────────────────────────────────────────
function LogDrawer({
  open,
  onClose,
  metrics,
  logEvents = [],
}: {
  open: boolean;
  onClose: () => void;
  metrics: RunMetrics;
  logEvents?: { level: "info" | "warn" | "error" | "success"; message: string; time: string }[];
}) {
  const lines = logEvents;

  const levelStyle = {
    info: { color: "text-white/50", prefix: "·" },
    success: { color: "text-[var(--system-green)]/80", prefix: "✓" },
    warn: { color: "text-amber-400/70", prefix: "⚠" },
    error: { color: "text-[var(--system-red)]/80", prefix: "✕" },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.32, 0, 0.16, 1] }}
            role="dialog"
            aria-label="Run Log"
            aria-modal="true"
            className="fixed bottom-[49px] left-4 right-4 z-50 rounded-xl overflow-hidden border-[0.5px] border-black/10 dark:border-white/[0.10] bg-background/80 backdrop-blur-xl shadow-[0_-8px_32px_rgba(0,0,0,0.45)]"
            style={{
              maxWidth: 680,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b-[0.5px] border-black/5 dark:border-white/[0.07]"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-foreground/50 dark:text-white/50" aria-hidden="true" />
                <span className="text-[13px] text-foreground/60 dark:text-white/60">Run Log</span>
                {metrics.timestamp && (
                  <span className="text-[12px] text-foreground/40 dark:text-white/40">
                    — {formatTimestamp(metrics.timestamp)}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close log"
                className="w-8 h-8 flex items-center justify-center rounded-md text-foreground/50 dark:text-white/50 hover:text-foreground/80 dark:hover:text-white/80 hover:bg-black/5 dark:hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* Log lines */}
            <div className="overflow-y-auto max-h-56 p-4 flex flex-col gap-1.5" role="log" aria-live="polite">
              {lines.length === 0 ? (
                <p className="text-[12px] text-foreground/40 dark:text-white/40 text-center py-4">
                  No log entries yet. Run Tidy to generate a log.
                </p>
              ) : (
                lines.map((line, i) => {
                  const s = levelStyle[line.level];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.15 }}
                      className="flex items-start gap-2.5"
                    >
                      <span className="text-[11px] font-mono text-foreground/50 dark:text-white/45 shrink-0 mt-px w-[60px]">
                        {line.time}
                      </span>
                      <span
                        className={`text-[11px] font-mono shrink-0 mt-px w-3 text-center ${s.color}`}
                        aria-hidden="true"
                      >
                        {s.prefix}
                      </span>
                      <span className={`text-[12px] font-mono ${s.color} leading-relaxed`}>
                        {line.message}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer stats */}
            {lines.length > 0 && (
              <div
                className="flex items-center gap-4 px-4 py-2.5 border-t-[0.5px] border-black/5 dark:border-white/[0.06]"
              >
                <div className="flex items-center gap-1">
                  <ChevronRight className="w-2.5 h-2.5 text-foreground/30 dark:text-white/30" aria-hidden="true" />
                  <span className="text-[11px] font-mono text-foreground/55 dark:text-white/50">
                    {lines.length} entries
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ChevronRight className="w-2.5 h-2.5 text-foreground/45 dark:text-white/40" aria-hidden="true" />
                  <span className="text-[11px] font-mono text-foreground/55 dark:text-white/50">
                    exit code {metrics.errors > 0 ? "1" : "0"}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── StatusBar ────────────────────────────────────────────────────────────────
export function StatusBar({ runState, metrics, logEvents = [] }: StatusBarProps) {
  const [logOpen, setLogOpen] = useState(false);

  const isRunning = runState === "running";
  const hasLastRun = metrics.timestamp !== null;
  const hasErrors = metrics.errors > 0;

  return (
    <>
      <LogDrawer
        open={logOpen}
        onClose={() => setLogOpen(false)}
        metrics={metrics}
        logEvents={logEvents}
      />

      <div
        className="flex items-center w-full"
        role="status"
        aria-label="Organization status"
        style={{
          height: "44px",
          fontFamily: "var(--font-sf)",
        }}
      >
        <div className="flex items-center w-full px-5">
          {/* ── Left: Last Run ──────────────────────────────── */}
          <div className="flex items-center gap-2 w-auto min-w-[140px] shrink-0">
            <span
              className="text-[13px] shrink-0 text-foreground/50 dark:text-white/50 font-medium"
            >
              Last Run
            </span>
            <AnimatePresence mode="wait">
              {isRunning ? (
                <motion.div
                  key="ts-running"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1"
                  aria-label="Running"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-[3px] h-[3px] rounded-full bg-[var(--system-blue)]"
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.22,
                      }}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.span
                  key="ts-value"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[13px] text-foreground/75 dark:text-white/70 truncate"
                >
                  {hasLastRun
                    ? formatTimestamp(metrics.timestamp!)
                    : "—"}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* ── Middle: Spacer ─────────────────────────────── */}
          <div className="flex-1 flex items-center justify-center p-1" aria-live="polite">
          </div>

          {/* ── Right: Metrics, Log & Status ────────────────── */}
          <div className="flex items-center gap-2.5 w-[320px] shrink-0 justify-end">
            <AnimatePresence mode="wait">
              {!isRunning && hasLastRun && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center"
                >
                  <MetricChip
                    icon={<ArrowRightLeft className="w-3 h-3" />}
                    value={metrics.moved}
                    label="moved"
                    colorClass="text-foreground/50 dark:text-white/50"
                  />
                  <MetricDivider />
                  <MetricChip
                    icon={<Pencil className="w-3 h-3" />}
                    value={metrics.renamed}
                    label="renamed"
                    colorClass="text-[var(--system-blue)]"
                  />
                  <MetricDivider />
                  <MetricChip
                    icon={<AlertCircle className="w-3 h-3" />}
                    value={metrics.errors}
                    label="errors"
                    colorClass={hasErrors ? "text-red-500/80 dark:text-red-400/80" : "text-foreground/40 dark:text-white/40"}
                    emphasized={hasErrors}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <MetricDivider />

            <button
              onClick={() => setLogOpen((o) => !o)}
              aria-label="View run log"
              aria-expanded={logOpen}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[7px] text-[13px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)] border-[0.5px] border-black/10 dark:border-white/10 ${hasErrors
                ? "text-[var(--system-red)] hover:text-[var(--system-red)] hover:bg-red-500/10 dark:hover:bg-[var(--system-red)]/20"
                : "text-[var(--mac-secondary-label)] hover:text-[var(--mac-label)] bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.07] dark:hover:bg-white/[0.07]"
                }`}
            >
              <ScrollText className="w-3 h-3" aria-hidden="true" />
              Log
            </button>

            <StatusDot runState={runState} />
          </div>
        </div>
      </div>
    </>
  );
}
