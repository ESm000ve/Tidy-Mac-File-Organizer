import { AnimatePresence, motion } from "motion/react";
import { FolderCard } from "../FolderCard";
import { ArrowRight, Folder, FolderFill } from "../icons";

interface LocationsSectionProps {
  sourcePath: string;
  destPath: string;
  onSourceChange: (path: string) => void;
  onDestChange: (path: string) => void;
  /** Opens the native folder picker; resolves to the chosen path, or null. */
  onBrowse: () => Promise<string | null>;
}

/** Source and destination pickers, plus a summary pill once both are set. */
export function LocationsSection({
  sourcePath,
  destPath,
  onSourceChange,
  onDestChange,
  onBrowse,
}: LocationsSectionProps) {
  const browseInto = (apply: (path: string) => void) => async () => {
    const chosen = await onBrowse();
    if (chosen) apply(chosen);
  };

  return (
    <section aria-label="Locations" className="flex flex-col gap-3">
      <div className="flex items-center justify-between pl-1">
        <h2 className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/60">
          Locations
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FolderCard
          label="Source"
          path={sourcePath}
          onPathChange={onSourceChange}
          onSelect={browseInto(onSourceChange)}
          accentColor="blue"
        />
        <FolderCard
          label="Destination"
          path={destPath}
          onPathChange={onDestChange}
          onSelect={browseInto(onDestChange)}
          accentColor="emerald"
        />
      </div>

      <AnimatePresence>
        {sourcePath && destPath && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/[0.05] border-[0.5px] border-black/10 dark:border-white/10"
              role="status"
              aria-live="polite"
              aria-label={`Source: ${sourcePath}, Destination: ${destPath}`}
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <div
                  className="w-5 h-5 rounded-md bg-[var(--system-blue)]/15 flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  <FolderFill className="w-3 h-3 text-[var(--system-blue)]" />
                </div>
                <span className="text-[13px] text-foreground/75 dark:text-white/70 truncate">
                  {sourcePath}
                </span>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-foreground/40 shrink-0" aria-hidden="true" />

              <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
                <span className="text-[13px] text-foreground/75 dark:text-white/70 truncate text-right">
                  {destPath}
                </span>
                <div
                  className="w-5 h-5 rounded-md bg-[var(--system-green)]/15 flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  <Folder className="w-3 h-3 text-[var(--system-green)]" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
