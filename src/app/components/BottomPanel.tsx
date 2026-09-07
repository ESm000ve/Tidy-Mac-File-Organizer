import { clsx } from "clsx";
import { format } from "date-fns";
import { DayPicker, useNavigation } from "react-day-picker";
import * as Popover from "@radix-ui/react-popover";

import { MacTimePicker } from "./MacTimePicker";

interface BottomPanelProps {
  scheduleType: "manual" | "daily" | "weekly" | "monthly";
  onScheduleTypeChange: (type: "manual" | "daily" | "weekly" | "monthly") => void;
  scheduleTime: string;
  onScheduleTimeChange: (time: string) => void;
  scheduleDate: Date | null;
  onScheduleDateChange: (date: Date | undefined) => void;
  conflictResolution: "rename" | "overwrite" | "skip" | "archive";
  onConflictResolutionChange: (res: "rename" | "overwrite" | "skip" | "archive") => void;
}

// ─── Design tokens — match App-wide spec ──────────────────────────────────────
const CARD_CLS = "bg-black/5 dark:bg-white/[0.08] border-[0.5px] border-black/10 dark:border-white/10";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function UpDownChevron({ className }: { className?: string }) {
  return (
    <svg className={className} width="10" height="14" viewBox="0 0 10 14"
      fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M2 5.5L5 2.5L8 5.5" />
      <path d="M2 8.5L5 11.5L8 8.5" />
    </svg>
  );
}

/** Flat macOS Pop-Up Button — White 5% fill, White 10% stroke, up/down chevron */
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "./icons";
function MacSelect({
  value,
  onValueChange,
  options,
  label,
}: {
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
  label?: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className="w-full bg-black/5 dark:bg-white/[0.05] border-[0.5px] border-black/10 dark:border-white/10 text-[13px] h-9 px-3 hover:bg-black/10 dark:hover:bg-white/[0.08] transition-colors"
        aria-label={label}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-black/10 dark:border-white/15">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-[13px] focus:bg-blue-500/10 focus:text-foreground">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CalendarCaption({ displayMonth }: { displayMonth: Date }) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation();
  return (
    <div className="flex items-center justify-between mb-3 px-0.5">
      <span className="text-[13px] text-foreground/90 dark:text-white/90">{format(displayMonth, "MMMM yyyy")}</span>
      <div className="flex items-center gap-0.5">
        <button type="button" disabled={!previousMonth}
          onClick={() => previousMonth && goToMonth(previousMonth)}
          aria-label="Previous month"
          className="w-8 h-8 flex items-center justify-center rounded-md text-foreground/60 dark:text-white/60 hover:text-foreground/90 dark:hover:text-white/90 hover:bg-black/5 dark:hover:bg-white/[0.08] transition-colors disabled:opacity-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]"
        >
          <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button type="button" disabled={!nextMonth}
          onClick={() => nextMonth && goToMonth(nextMonth)}
          aria-label="Next month"
          className="w-8 h-8 flex items-center justify-center rounded-md text-foreground/60 dark:text-white/60 hover:text-foreground/90 dark:hover:text-white/90 hover:bg-black/5 dark:hover:bg-white/[0.08] transition-colors disabled:opacity-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]"
        >
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

const SEGMENTS = ["manual", "daily", "weekly", "monthly"] as const;

export function BottomPanel({
  scheduleType, onScheduleTypeChange,
  scheduleTime, onScheduleTimeChange,
  scheduleDate, onScheduleDateChange,
  conflictResolution, onConflictResolutionChange,
}: BottomPanelProps) {
  return (
    <section className="space-y-3" aria-label="Schedule and Conflict Resolution">
      <h2 className="text-[13px] font-medium text-muted-foreground pl-0.5">Schedule &amp; Conflict</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ── Schedule Card — no blur, no shadow ── */}
        <div className={`rounded-xl p-5 ${CARD_CLS}`}>
          <label className="text-[13px] text-muted-foreground block mb-3" id="frequency-label">Frequency</label>

          <div className="flex flex-col gap-4">

            {/* Segmented Control — recessed pill track */}
            <div
              role="radiogroup"
              aria-labelledby="frequency-label"
              className="flex items-center gap-0.5 p-[3px] rounded-[9px] w-fit select-none bg-black/5 dark:bg-black/25 border-[0.5px] border-black/10 dark:border-black/35 shadow-inner shadow-black/5 dark:shadow-black/35"
            >
              {SEGMENTS.map((type) => (
                <button
                  key={type}
                  role="radio"
                  onClick={() => onScheduleTypeChange(type)}
                  aria-checked={scheduleType === type}
                  className={clsx(
                    "px-3.5 py-[5px] text-[13px] rounded-[6px] transition-all capitalize",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]",
                    scheduleType === type ? "text-foreground dark:text-white bg-white shadow-sm dark:bg-white/[0.12] dark:shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.14)]" : "text-muted-foreground hover:text-foreground/80 dark:hover:text-white/55"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Time + Date */}
            {scheduleType !== "manual" && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <MacTimePicker value={scheduleTime} onChange={onScheduleTimeChange} />

                <Popover.Root>
                  <Popover.Trigger asChild>
                    <button
                      aria-label={`Select date${scheduleDate ? `: ${format(scheduleDate, "MM/dd/yyyy")}` : ""}`}
                      className="flex items-center gap-1.5 text-foreground/80 dark:text-white/80 text-[13px] px-2.5 py-[7px] rounded-md hover:bg-black/5 dark:hover:bg-white/[0.06] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)] bg-black/5 dark:bg-white/[0.05] border-[0.5px] border-black/10 dark:border-white/10"
                    >
                      <CalendarIcon className="w-3 h-3 text-foreground/50 dark:text-white/50 shrink-0" aria-hidden="true" />
                      {scheduleDate ? format(scheduleDate, "MM/dd/yyyy") : "mm/dd/yyyy"}
                    </button>
                  </Popover.Trigger>

                  <Popover.Portal>
                    <Popover.Content
                      sideOffset={6}
                      align="start"
                      className="z-50 rounded-xl p-3 bg-popover/90 backdrop-blur-xl border border-border shadow-[0_16px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_32px_rgba(0,0,0,0.50)]"
                    >
                      <DayPicker
                        mode="single"
                        selected={scheduleDate || undefined}
                        onSelect={onScheduleDateChange}
                        components={{ Caption: CalendarCaption }}
                        classNames={{
                          months: "flex flex-col",
                          month: "",
                          caption: "",
                          caption_label: "hidden",
                          nav: "hidden",
                          table: "border-collapse",
                          head_row: "",
                          head_cell: "w-8 h-7 text-center text-[12px] text-foreground/50 dark:text-white/50 uppercase tracking-wider",
                          tbody: "",
                          row: "",
                          cell: "p-0 text-center",
                          day: "w-8 h-8 inline-flex items-center justify-center rounded-full text-[13px] text-foreground/80 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/[0.10] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]",
                          day_selected: "!bg-[var(--system-blue)] !text-white hover:!bg-[var(--system-blue)]/90 rounded-full",
                          day_today: "!text-[var(--system-blue)]",
                          day_outside: "!text-foreground/30 dark:!text-white/30",
                          day_disabled: "!text-foreground/30 dark:!text-white/25 cursor-not-allowed",
                        }}
                      />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              </div>
            )}
          </div>
        </div>

        {/* ── Conflict Resolution Card — no blur, no shadow ── */}
        <div className={`rounded-xl p-5 ${CARD_CLS}`}>
          <label className="text-[13px] text-muted-foreground block mb-3" id="conflict-label">If File Exists</label>
          <div className="space-y-3">
            <MacSelect
              value={conflictResolution}
              onValueChange={(v) => onConflictResolutionChange(v as any)}
              label="Conflict resolution strategy"
              options={[
                { value: "rename", label: "Keep Both (Append Number)" },
                { value: "archive", label: "Archive Duplicates Safely" },
                { value: "skip", label: "Skip Processing" },
                { value: "overwrite", label: "Overwrite (Danger)" },
              ]}
            />
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              "Archive" isolates duplicates into a designated <code className="bg-black/5 dark:bg-white/10 px-1 rounded">Duplicates_Archive/</code> folder for safe later deletion.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
