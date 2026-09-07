import { useState, useRef, useEffect, KeyboardEvent } from "react";

import { clsx } from "clsx";

import { ChevronRight, Folder, FolderFill as FolderOpen, Pencil, Upload, X } from "./icons";
interface FolderCardProps {
  label: string;
  path: string;
  onPathChange: (path: string) => void;
  onSelect: () => void;
  icon?: React.ReactNode;
  accentColor?: "blue" | "emerald";
}

const DEFAULT_PATHS: Record<string, string> = {
  Source: "/Users/username/Desktop",
  Destination: "/Users/username/Documents/Organized",
};

// ─── Apple HIG macOS 2026 glass material ──────────────────────────────────────
const GLASS_CLS = "bg-black/5 dark:bg-white/[0.08] border-[0.5px] border-black/20 dark:border-white/20";
const DRAG_CLS = "bg-[var(--system-blue)]/10 dark:bg-[var(--system-blue)]/[0.06] border-[0.5px] border-[var(--system-blue)]/50 dark:border-[var(--system-blue)]/[0.45]";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseSegments(path: string): { label: string; dimmed: boolean }[] {
  const raw = path.replace(/\\/g, "/").replace(/\/+/g, "/").replace(/\/$/, "");
  const parts = raw.split("/").filter(Boolean);
  if (parts.length === 0) return [{ label: path, dimmed: false }];
  let segments = parts;
  if (parts[0] === "Users" && parts.length >= 2)
    segments = [`~${parts[1]}`, ...parts.slice(2)];
  return segments.map((s, i) => ({ label: s, dimmed: i < segments.length - 1 }));
}

function PathBreadcrumb({ path }: { path: string }) {
  return (
    <div className="flex items-center gap-0.5 flex-wrap min-w-0" aria-label="Folder Path">
      {parseSegments(path).map((seg, i) => (
        <span key={i} className="flex items-center gap-0.5 min-w-0">
          {i > 0 && <ChevronRight className="w-3 h-3 text-foreground/40 dark:text-white/35 shrink-0" aria-hidden="true" />}
          <span
            className={clsx(
              "text-[14px] leading-none truncate",
              seg.dimmed ? "text-foreground/60 dark:text-white/50" : "text-foreground dark:text-white/90 font-semibold"
            )}
          >
            {seg.label}
          </span>
        </span>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function FolderCard({
  label, path, onPathChange, onSelect, accentColor = "blue",
}: FolderCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEmpty = !path.trim();

  useEffect(() => {
    if (isEditing) { inputRef.current?.focus(); inputRef.current?.select(); }
  }, [isEditing]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.stopPropagation(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
    const item = e.dataTransfer.items?.[0];
    if (item?.kind === "file") {
      const f = item.getAsFile();
      const realPath = (f as any)?.path;
      if (realPath) {
        onPathChange(realPath);
      }
    }
  };

  const handleEmptyKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  const accent = {
    blue: { badge: "bg-[var(--system-blue)]/20 text-[var(--system-blue)]", glow: "from-[var(--system-blue)]/[0.08]" },
    emerald: { badge: "bg-[var(--system-green)]/20 text-[var(--system-green)]", glow: "from-[var(--system-green)]/[0.08]" },
    purple: { badge: "bg-[var(--system-purple)]/20 text-[var(--system-purple)]", glow: "from-[var(--system-purple)]/[0.08]" }
  }[accentColor as "blue" | "emerald" | "purple"] || { badge: "", glow: "" };

  // ── Empty / Drop-zone ────────────────────────────────────────────────────
  if (isEmpty) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`Select ${label} Folder`}
        onKeyDown={handleEmptyKeyDown}
        className={clsx(
          "relative rounded-xl flex flex-col items-center justify-center gap-3 text-center transition-all duration-300 group min-h-[130px] p-8",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)] focus-visible:border-transparent",
          isDragOver
            ? "bg-[var(--system-blue)]/10 dark:bg-[var(--system-blue)]/[0.05] border-[1px] border-[var(--system-blue)]/60 dark:border-[var(--system-blue)]/[0.55]"
            : "bg-black/[0.03] dark:bg-white/[0.06] border-[0.5px] border-black/10 dark:border-white/20 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={onSelect}
        style={{ fontFamily: "var(--font-sf)" }}
      >
        {/* Icon */}
        <div
          className={clsx(
            "w-14 h-14 rounded-[11px] flex items-center justify-center transition-all duration-300",
            isDragOver
              ? "bg-[var(--system-blue)]/20 text-[var(--system-blue)] dark:text-[var(--system-blue)] scale-110"
              : "bg-black/10 dark:bg-white/[0.1] text-foreground/60 dark:text-white/50 group-hover:bg-black/15 dark:group-hover:bg-white/[0.15] group-hover:text-foreground/80 dark:group-hover:text-white/70"
          )}
          aria-hidden="true"
        >
          {isDragOver ? <Upload className="w-7 h-7" /> : <FolderOpen className="w-7 h-7" />}
        </div>

        {/* Copy */}
        <div className="space-y-1">
          <p className={clsx(
            "text-[11px] font-semibold transition-colors",
            isDragOver ? "text-[var(--system-blue)] dark:text-[var(--system-blue)]" : "text-foreground/70 dark:text-white/60"
          )}>
            {label}
          </p>
          <p className={clsx(
            "text-[14px] transition-colors font-medium",
            isDragOver ? "text-[var(--system-blue)] dark:text-[var(--system-blue)]" : "text-foreground/70 dark:text-white/60 group-hover:text-foreground/80 dark:group-hover:text-white/80"
          )}>
            {isDragOver ? "Release to set path" : `Drag ${label} Folder Here`}
          </p>
        </div>

        {/* Browse styling (visually looks like a button but it's part of the parent button) */}
        <div
          className={clsx(
            "px-4 py-1.5 text-[13px] font-medium rounded-[8px] transition-all text-foreground/80 dark:text-white/80 bg-black/5 dark:bg-white/[0.1] border-[1px] border-black/20 dark:border-white/20 group-hover:bg-black/10 dark:group-hover:bg-white/[0.15]",
            isDragOver && "opacity-0 pointer-events-none"
          )}
          aria-hidden="true"
        >
          Browse…
        </div>
      </div>
    );
  }

  // ── Filled state ─────────────────────────────────────────────────────────
  return (
    <div
      className={clsx("rounded-xl overflow-hidden group transition-colors duration-200 relative", isDragOver ? DRAG_CLS : GLASS_CLS)}
      style={{ fontFamily: "var(--font-sf)" }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-3.5 p-4">
        {/* Icon badge */}
        <div className={clsx("w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0 transition-all", accent.badge)} aria-hidden="true">
          {accentColor === "blue"
            ? <FolderOpen className="w-5 h-5" />
            : <Folder className="w-5 h-5" />}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-foreground/50 dark:text-white/45 mb-2 select-none" id={`label-${label}`}>{label}</p>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              aria-labelledby={`label-${label}`}
              value={path}
              onChange={(e) => onPathChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setIsEditing(false); }}
              className="w-full rounded-md px-2 py-1 text-[14px] text-foreground dark:text-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)] font-mono bg-black/5 dark:bg-white/[0.1] border-[1px] border-black/20 dark:border-white/30"
            />
          ) : (
            <button
              type="button"
              className="group/path flex items-center gap-2 w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)] rounded-md px-1 -mx-1 py-1"
              onClick={() => setIsEditing(true)}
              aria-label={`Edit ${label} path`}
              title="Click to edit path"
            >
              <PathBreadcrumb path={path} />
              <Pencil className="w-3.5 h-3.5 text-foreground/60 dark:text-white/50 opacity-0 group-hover/path:opacity-100 transition-opacity shrink-0 focus-visible:opacity-100" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 ml-1 relative z-10">
          <button
            type="button"
            onClick={() => onPathChange("")}
            aria-label={`Clear ${label} path`}
            title="Clear"
            className="w-8 h-8 flex items-center justify-center rounded-md text-foreground/60 dark:text-white/60 hover:text-foreground/90 dark:hover:text-white/90 hover:bg-black/10 dark:hover:bg-white/[0.15] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onSelect}
            aria-label={`Select new ${label} path`}
            className="px-3.5 py-1.5 font-semibold text-[var(--system-blue)] hover:bg-[var(--system-blue)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)] text-[13px] rounded-[8px] transition-all bg-transparent border-[0.5px] border-transparent"
          >
            Select
          </button>
        </div>
      </div>

      {/* Hover glow */}
      <div className={clsx(
        "absolute inset-0 bg-gradient-to-br to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity",
        accent.glow
      )} />
    </div>
  );
}