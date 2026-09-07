import { useMemo, useRef, useEffect } from "react";
import * as Popover from "@radix-ui/react-popover";
import { clsx } from "clsx";

import { Clock } from "./icons";
interface MacTimePickerProps {
  /** 24-hour "HH:MM" string, e.g. "09:00" */
  value: string;
  onChange: (value: string) => void;
}

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 0,5,10…55

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Parse "HH:MM" → { h12, minute, period } */
function parseTime(value: string) {
  const [hStr, mStr] = value.split(":");
  const h24 = parseInt(hStr, 10) || 0;
  const minute = parseInt(mStr, 10) || 0;
  const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  // Round minute to nearest 5
  const snappedMin = Math.round(minute / 5) * 5;
  return { h12, minute: snappedMin >= 60 ? 55 : snappedMin, period };
}

/** Convert { h12, minute, period } → "HH:MM" */
function buildTime(h12: number, minute: number, period: "AM" | "PM") {
  let h24 = h12 % 12;
  if (period === "PM") h24 += 12;
  return `${pad(h24)}:${pad(minute)}`;
}

/** One scrollable column */
function Column<T extends string | number>({
  items,
  selected,
  onSelect,
  label,
  ariaLabel,
}: {
  items: T[];
  selected: T;
  onSelect: (v: T) => void;
  label: (v: T) => string;
  ariaLabel: string;
}) {
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Scroll selected item into view on mount / when selection changes
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
  }, [selected]);

  return (
    <div
      className="flex flex-col overflow-y-auto max-h-[220px] scrollbar-none px-1 py-1"
      role="listbox"
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const isSelected = item === selected;
        return (
          <button
            key={item}
            ref={isSelected ? selectedRef : undefined}
            type="button"
            role="option"
            aria-selected={isSelected}
            onClick={() => onSelect(item)}
            className={clsx(
              "px-3 py-[5px] text-[14px] rounded-[7px] transition-all text-left whitespace-nowrap select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]",
              isSelected
                ? "bg-[var(--system-blue)] text-white font-semibold"
                : "text-foreground/70 dark:text-[#EBEBF5]/70 hover:text-foreground/90 hover:bg-black/5 dark:hover:text-[#EBEBF5]/90 dark:hover:bg-white/[0.07]"
            )}
          >
            {label(item)}
          </button>
        );
      })}
    </div>
  );
}

export function MacTimePicker({ value, onChange }: MacTimePickerProps) {
  const { h12, minute, period } = useMemo(() => parseTime(value), [value]);

  const displayTime = `${h12}:${pad(minute)} ${period}`;

  const setHour = (h: number) => onChange(buildTime(h, minute, period));
  const setMinute = (m: number) => onChange(buildTime(h12, m, period));
  const setPeriod = (p: "AM" | "PM") => onChange(buildTime(h12, minute, p));

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={`Select time, currently ${displayTime}`}
          className="flex items-center gap-1.5 text-foreground/80 dark:text-white/80 text-[13px] px-2.5 py-[7px] rounded-md hover:bg-black/5 dark:hover:bg-white/[0.06] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)] bg-black/5 dark:bg-white/[0.05] border-[0.5px] border-black/10 dark:border-white/10"
        >
          <Clock className="w-3 h-3 text-foreground/50 dark:text-white/50 shrink-0" aria-hidden="true" />
          <span className="tabular-nums">{displayTime}</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          align="start"
          className="z-50 rounded-xl p-1 flex gap-0 bg-popover/90 backdrop-blur-xl border border-border shadow-[0_12px_28px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.45)]"
        >
          {/* Hours */}
          <Column
            items={HOURS}
            selected={h12}
            onSelect={setHour}
            label={(h) => String(h)}
            ariaLabel="Hours"
          />

          {/* Thin divider */}
          <div className="w-px bg-border my-2 self-stretch shrink-0" aria-hidden="true" />

          {/* Minutes */}
          <Column
            items={MINUTES}
            selected={minute}
            onSelect={setMinute}
            label={(m) => pad(m)}
            ariaLabel="Minutes"
          />

          {/* Thin divider */}
          <div className="w-px bg-border my-2 self-stretch shrink-0" aria-hidden="true" />

          {/* AM / PM */}
          <Column
            items={["AM", "PM"] as const}
            selected={period}
            onSelect={setPeriod}
            label={(p) => p}
            ariaLabel="AM or PM"
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}