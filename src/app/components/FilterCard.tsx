import { clsx } from "clsx";
import * as Switch from "@radix-ui/react-switch";

import { ChevronRight, type Icon } from "./icons";

interface FilterCardProps {
  label: string;
  count?: string;
  icon: Icon;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  color?: string;
  expanded?: boolean;
  onExpandToggle: () => void;
}

/**
 * Header row for a file-rule bento tile.
 * Card chrome (background, border, blur, radius) is owned by the parent wrapper in App.tsx.
 */
export function FilterCard({
  label, count = "0 types", icon: Icon, enabled, onToggle, color = "blue", expanded, onExpandToggle
}: FilterCardProps) {

  // Category accent colours — always use the same hue family at low opacity for the badge
  const BADGE: Record<string, string> = {
    blue: "bg-[var(--system-blue)]/15 text-[var(--system-blue)]",
    purple: "bg-[var(--system-purple)]/15 text-[var(--system-purple)]",
    orange: "bg-[var(--system-orange)]/15 text-[var(--system-orange)]",
    green: "bg-[var(--system-green)]/15 text-[var(--system-green)]",
    yellow: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
    red: "bg-red-500/15 text-red-700 dark:text-red-400",
  };
  const badgeCls = BADGE[color] ?? BADGE.blue;

  const switchId = `toggle-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="flex items-center">
      {/* ── Left: disclosure + icon + label ── */}
      <button
        type="button"
        onClick={onExpandToggle}
        aria-expanded={expanded}
        aria-controls={`${switchId}-content`}
        className="flex-1 flex items-center gap-3 p-4 select-none min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)] rounded-l-[11px]"
      >
        <ChevronRight
          aria-hidden="true"
          className={clsx(
            "w-3.5 h-3.5 text-foreground/60 dark:text-white/60 transition-transform duration-200 shrink-0",
            expanded && "rotate-90"
          )}
        />

        <div
          className={clsx(
            "w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0 transition-colors",
            enabled ? badgeCls : "bg-black/5 dark:bg-white/[0.04] text-foreground/40 dark:text-white/40"
          )}
          aria-hidden="true"
        >
          <Icon className="w-[18px] h-[18px]" />
        </div>

        {/* Label + count */}
        <div className="flex-1 min-w-0">
          <h3
            id={switchId + "-label"}
            className={clsx(
              "text-[15px] transition-colors truncate",
              enabled ? "text-foreground/90 dark:text-white/90" : "text-foreground/50 dark:text-white/50"
            )}
          >
            {label}
          </h3>
          <p className="text-[13px] text-foreground/60 dark:text-white/60 tabular-nums">{count}</p>
        </div>
      </button>

      {/* ── Right: toggle — isolates from parent expand click ── */}
      <div
        className="px-4 flex items-center shrink-0"
        onClick={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
        onKeyDown={(e) => { e.stopPropagation(); }}
      >
        <Switch.Root
          checked={enabled}
          onCheckedChange={onToggle}
          aria-labelledby={switchId + "-label"}
          className="rounded-full relative transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-background shrink-0"
          style={{
            width: 42, height: 24,
            background: enabled ? "var(--system-green)" : "var(--mac-toggle-off)",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.25)",
          }}
        >
          <Switch.Thumb
            className="block bg-white rounded-full transition-transform duration-200 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]"
            style={{
              width: 20, height: 20,
              boxShadow: "0 1px 2px rgba(0,0,0,0.30), inset 0 0 0 0.5px rgba(0,0,0,0.10)",
            }}
          />
        </Switch.Root>
      </div>
    </div>
  );
}