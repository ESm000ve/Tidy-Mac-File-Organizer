import type { CSSProperties } from "react";
import * as Switch from "@radix-ui/react-switch";

type ToggleColor = "green" | "blue" | "purple";
type ToggleSize = "sm" | "md";

/** Track/thumb geometry in px, keyed by size. `travel` is the thumb's x-offset when on. */
const GEOMETRY: Record<ToggleSize, { width: number; height: number; thumb: number; travel: number }> = {
  sm: { width: 32, height: 18, thumb: 14, travel: 16 },
  md: { width: 42, height: 24, thumb: 20, travel: 19 },
};

const TRACK_COLOR: Record<ToggleColor, string> = {
  green: "var(--system-green)",
  blue: "var(--system-blue)",
  purple: "var(--system-purple)",
};

interface MacToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  color?: ToggleColor;
  size?: ToggleSize;
  /** Id of the element naming this toggle, when the label sits outside it. */
  "aria-labelledby"?: string;
  /** Id of the element describing this toggle's effect. */
  "aria-describedby"?: string;
  /** Accessible name, when there is no visible label to point at. */
  "aria-label"?: string;
}

/** A macOS-style switch: recessed track, white thumb, system-colour fill when on. */
export function MacToggle({
  checked,
  onCheckedChange,
  disabled,
  color = "green",
  size = "md",
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
}: MacToggleProps) {
  const { width, height, thumb, travel } = GEOMETRY[size];

  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
      className="rounded-full relative transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-background shrink-0"
      style={{
        width,
        height,
        background: checked ? TRACK_COLOR[color] : "var(--mac-toggle-off)",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.25)",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Switch.Thumb
        className="block bg-white rounded-full transition-transform duration-200 will-change-transform translate-x-0.5 data-[state=checked]:translate-x-[var(--thumb-travel)]"
        style={
          {
            width: thumb,
            height: thumb,
            "--thumb-travel": `${travel}px`,
            boxShadow: "0 1px 2px rgba(0,0,0,0.30), inset 0 0 0 0.5px rgba(0,0,0,0.10)",
          } as CSSProperties
        }
      />
    </Switch.Root>
  );
}
