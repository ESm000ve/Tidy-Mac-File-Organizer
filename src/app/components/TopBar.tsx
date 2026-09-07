import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";

import { Play, Search, X } from "./icons";
interface TopBarProps {
  title?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchOpen: boolean;
  onSearchOpenChange: (open: boolean) => void;
  runState?: "idle" | "scanning" | "running" | "completed" | "error";
  progress?: number;
  onRunTidy?: () => void;
  isFullScreen?: boolean;
  children?: React.ReactNode;
}

export function TopBar({
  title = "Tidy",
  searchQuery,
  onSearchChange,
  searchOpen,
  onSearchOpenChange,
  runState = "idle",
  progress = 0,
  onRunTidy,
  isFullScreen = false,
  children,
}: TopBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [searchOpen]);

  const handleOpen = () => onSearchOpenChange(true);
  const handleClose = () => {
    onSearchChange("");
    onSearchOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") handleClose();
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        if (!searchOpen) {
          handleOpen();
        } else {
          inputRef.current?.focus();
        }
      } else if (e.key === "Escape" && searchOpen && document.activeElement === inputRef.current) {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [searchOpen, onSearchOpenChange, onSearchChange]);

  return (
    <div
      className={clsx(
        "h-[52px] flex items-center pr-4 shrink-0 z-20 sticky top-0 select-none border-b border-black/[0.08] dark:border-white/[0.08] bg-[var(--mac-window-background)]/90 backdrop-blur-2xl transition-all duration-300",
        isFullScreen ? "pl-4" : "pl-[76px]"
      )}
      style={{
        // @ts-ignore — Electron window drag region
        WebkitAppRegion: isFullScreen ? "none" : "drag",
      }}
    >
      {/* ── Left: Spacer (Removes Title) ── */}
      <div className="flex-1" />

      {/* ── Center: Progress Indicator ── */}
      <div className="flex-1 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          {runState === "running" && (
            <motion.div
              key="running-msg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <span className="text-[13px] font-medium text-foreground/60 dark:text-white/60">
                Organizing…
              </span>
              <span
                className="text-[13px] tabular-nums font-bold text-foreground/80 dark:text-white/80"
              >
                {Math.round(progress)}%
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Right: Finder-style Toolbar Actions ── */}
      <div className="flex-1 flex items-center justify-end">
        <div className="flex items-center gap-3" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          
          {/* Run Button (Matches Finder Utility Capsule) */}
          <AnimatePresence mode="wait">
            {runState !== "running" && onRunTidy && (
              <motion.button
                key="run-tidy-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onRunTidy}
                disabled={runState === "scanning"}
                className={clsx(
                  "flex items-center gap-1.5 px-2.5 py-[5px] rounded-[6px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]",
                  "bg-black/5 dark:bg-white/[0.08] hover:bg-black/10 dark:hover:bg-white/[0.12] border-[0.5px] border-black/[0.08] dark:border-white/[0.08] shadow-[0_1px_1px_rgba(0,0,0,0.02)] active:opacity-80 disabled:opacity-50"
                )}
              >
                <Play className="w-[11px] h-[11px] text-foreground/80 dark:text-white/80" aria-hidden="true" />
                <span className="text-[12px] font-medium text-foreground/80 dark:text-white/80">
                  {runState === "scanning" ? "Scanning" : "Run Tidy"}
                </span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Utility Icons (Standalone, Matches Finder Share/Tags icons) */}
          <div className="flex items-center gap-1">
            {children}
          </div>

          {/* Search Bar (Matches Finder Search) */}
          <div className="flex items-center" role="search" aria-label="Search">
            <AnimatePresence mode="wait" initial={false}>
              {searchOpen ? (
                <motion.div
                  key="search-expanded"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 160, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex items-center gap-1.5 bg-black/5 dark:bg-white/[0.08] border-[0.5px] border-black/[0.08] dark:border-white/[0.08] rounded-[6px] px-2 py-[4px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden"
                >
                  <Search className="w-3.5 h-3.5 text-foreground/40 shrink-0 ml-0.5" aria-hidden="true" />
                  <input
                    ref={inputRef}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Rules, Categories, and More"
                    aria-label="Search rules and categories"
                    type="search"
                    className="flex-1 bg-transparent text-[12px] text-foreground/80 placeholder:text-foreground/40 focus:outline-none min-w-0"
                  />
                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Clear search"
                    className="shrink-0 p-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-[4px] transition-colors"
                  >
                    <X className="w-2.5 h-2.5 text-foreground/50" />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="search-icon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  type="button"
                  onClick={handleOpen}
                  aria-label="Open search"
                  className="w-7 h-7 flex items-center justify-center rounded-[6px] text-foreground/60 dark:text-white/60 hover:bg-black/[0.06] dark:hover:bg-white/[0.1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]"
                >
                  <Search className="w-[14px] h-[14px]" aria-hidden="true" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}