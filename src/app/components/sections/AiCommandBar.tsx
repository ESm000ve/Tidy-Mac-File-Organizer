import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { clsx } from "clsx";
import { Sparkles } from "../icons";
import type { AiFeedback } from "../../types";

/** Prompts offered when the input is empty, to show what the parser understands. */
const EXAMPLE_PROMPTS = [
  "Move old PDFs to Archive",
  "Organize screenshots by date",
  "Find and remove duplicates",
  "Rename files with smart names",
] as const;

interface AiCommandBarProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  /** True while the rule is being parsed. */
  busy: boolean;
  feedback: AiFeedback | null;
  /** Opens the full rule builder sheet. */
  onOpenAdvanced: () => void;
}

/** Container styling keyed by the bar's current state. */
function containerClasses(busy: boolean, feedback: AiFeedback | null): string {
  if (busy) {
    return "bg-[var(--system-purple)]/[0.08] dark:bg-[var(--system-purple)]/[0.13] border-[var(--system-purple)]/30";
  }
  if (feedback?.type === "success") {
    return "bg-[var(--system-green)]/[0.07] dark:bg-[var(--system-green)]/[0.12] border-[var(--system-green)]/25";
  }
  if (feedback?.type === "error") {
    return "bg-red-500/[0.06] dark:bg-red-500/[0.10] border-red-500/20";
  }
  return "bg-[var(--system-purple)]/[0.06] dark:bg-[var(--system-purple)]/[0.10] border-[var(--system-purple)]/15 focus-within:border-[var(--system-purple)]/35 focus-within:bg-[var(--system-purple)]/[0.09]";
}

function headline(busy: boolean, feedback: AiFeedback | null): string {
  if (busy) return "AI is thinking…";
  if (feedback?.type === "success") return "Done!";
  if (feedback?.type === "error") return "Couldn't process";
  return "Ask Tidy AI";
}

/** Natural-language entry point: one sentence in, organizer rules out. */
export function AiCommandBar({
  value,
  onValueChange,
  onSubmit,
  busy,
  feedback,
  onOpenAdvanced,
}: AiCommandBarProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <section aria-label="Ask Tidy AI">
      <div
        className={clsx(
          "rounded-xl border-[0.5px] transition-all duration-200 overflow-hidden",
          containerClasses(busy, feedback),
        )}
      >
        <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-0">
          <div
            className={clsx(
              "w-6 h-6 rounded-[7px] flex items-center justify-center shrink-0 transition-colors",
              busy && "bg-[var(--system-purple)]/20",
              !busy && feedback?.type === "success" && "bg-[var(--system-green)]/20",
              !busy && feedback?.type === "error" && "bg-red-500/15",
              !busy && !feedback && "bg-[var(--system-purple)]/12 dark:bg-[var(--system-purple)]/20",
            )}
          >
            {busy ? (
              <div
                className="w-3 h-3 border-[1.5px] border-[var(--system-purple)]/30 border-t-[var(--system-purple)] rounded-full animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Sparkles
                className={clsx(
                  "w-3 h-3",
                  feedback?.type === "success" && "text-[var(--system-green)]",
                  feedback?.type === "error" && "text-red-500",
                  !feedback && "text-[var(--system-purple)]",
                )}
                aria-hidden="true"
              />
            )}
          </div>

          <span className="text-[12px] font-semibold text-foreground/70 dark:text-white/60 flex-1">
            {headline(busy, feedback)}
          </span>

          <span
            className="flex items-center gap-[3px] text-[9px] font-bold uppercase tracking-wider text-[var(--system-purple)]/60 bg-[var(--system-purple)]/10 px-1.5 py-0.5 rounded-sm border border-[var(--system-purple)]/20"
            aria-label="Powered by AI"
          >
            <Sparkles className="w-2 h-2" aria-hidden="true" />
            AI
          </span>
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.p
              key={feedback.message}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className={clsx(
                "px-4 pt-2 text-[12px] leading-relaxed",
                feedback.type === "success" ? "text-[var(--system-green)]" : "text-red-500",
              )}
            >
              {feedback.message}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2 px-3 pt-2 pb-3">
          <label htmlFor="nl-inline-input" className="sr-only">
            Describe what you'd like Tidy to do
          </label>
          <textarea
            ref={inputRef}
            id="nl-inline-input"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            onKeyDown={(event) => {
              // Enter submits; Shift+Enter inserts a newline.
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSubmit();
              }
            }}
            placeholder="e.g. Move all PDFs older than a year to Archive, rename my screenshots by date…"
            disabled={busy}
            rows={2}
            aria-label="Natural language rule input — press Enter to apply"
            className="flex-1 bg-transparent text-[13px] text-foreground/85 dark:text-white/85 placeholder:text-foreground/35 dark:placeholder:text-white/30 resize-none focus:outline-none leading-relaxed disabled:opacity-50 min-h-[40px] max-h-[120px]"
          />
          <button
            id="nl-send-btn"
            type="button"
            onClick={onSubmit}
            disabled={!value.trim() || busy}
            aria-label="Apply AI rule"
            className={clsx(
              "shrink-0 w-8 h-8 rounded-[9px] flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]",
              value.trim() && !busy
                ? "bg-[var(--system-purple)] text-white hover:opacity-90 active:scale-95 shadow-sm shadow-[var(--system-purple)]/25"
                : "bg-black/[0.06] dark:bg-white/[0.06] text-foreground/30 dark:text-white/30 cursor-not-allowed",
            )}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 10V2M2 6l4-4 4 4" />
            </svg>
          </button>
        </div>

        {!value && !busy && !feedback && (
          <div className="flex flex-wrap gap-1.5 px-4 pb-3">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  onValueChange(prompt);
                  inputRef.current?.focus();
                }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--system-purple)]/[0.08] dark:bg-[var(--system-purple)]/[0.12] text-[var(--system-purple)]/70 border border-[var(--system-purple)]/15 hover:bg-[var(--system-purple)]/15 hover:text-[var(--system-purple)] transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--system-purple)]/10">
          <p className="text-[11px] text-foreground/40 dark:text-white/30">
            {busy ? "Processing your request with AI…" : "Press Enter to apply · Shift+Enter for new line"}
          </p>
          <button
            type="button"
            onClick={onOpenAdvanced}
            className="text-[11px] text-[var(--system-purple)]/60 hover:text-[var(--system-purple)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--mac-focus-ring)] rounded"
          >
            Advanced editor ›
          </button>
        </div>
      </div>
    </section>
  );
}
