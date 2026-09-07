import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Toaster } from "sonner";

import { AccessibilityPanel } from "./components/AccessibilityPanel";
import { AuditLogSidebar, AuditLogToggleButton } from "./components/AuditLogSidebar";
import { BottomPanel } from "./components/BottomPanel";
import { InsightsSidebar, InsightsToggleButton } from "./components/InsightsSidebar";
import { NaturalLanguageRuleBuilder } from "./components/NaturalLanguageRuleBuilder";
import { NoticeDialog } from "./components/NoticeDialog";
import { PreviewSheet } from "./components/PreviewSheet";
import { StatusBar, type RunState } from "./components/StatusBar";
import { TopBar } from "./components/TopBar";
import { AiCommandBar } from "./components/sections/AiCommandBar";
import { FiltersSection } from "./components/sections/FiltersSection";
import { LocationsSection } from "./components/sections/LocationsSection";
import { RulesSection } from "./components/sections/RulesSection";

import { useAppShortcuts } from "./hooks/useAppShortcuts";
import { useCategoryRules } from "./hooks/useCategoryRules";
import { useFolderInsights } from "./hooks/useFolderInsights";
import { useMenuActions } from "./hooks/useMenuActions";
import { useOrganizerRun } from "./hooks/useOrganizerRun";
import { usePersistentState } from "./hooks/usePersistentState";
import { useFullScreen, useSystemAccentColor } from "./hooks/useSystemAppearance";

import { applyCategoryPatch, applyFilterPatch, readPath, type AiRulePatch } from "./lib/aiRules";
import { generatePythonScript, type OrganizerConfig } from "./lib/generateScript";
import { buildInsightGroups } from "./lib/insights";
import { STORAGE_KEYS } from "./constants";
import type { AiFeedback, ConflictResolution, Filters, ScheduleType } from "./types";

const DEFAULT_FILTERS: Filters = {
  dateModified: "any",
  fileSize: "any",
  excludeHidden: false,
};

/** How long a transient AI status message stays on screen, in milliseconds. */
const AI_FEEDBACK_TIMEOUT = { success: 4000, running: 5000 } as const;

/**
 * Tidy's root view.
 *
 * `App` owns the settings the user edits directly and composes them into an
 * `OrganizerConfig`. The behaviour built on top of that config — previewing,
 * running, undoing, reacting to menus and shortcuts — lives in the hooks under
 * `./hooks`, and the screen is assembled from the sections under
 * `./components/sections`.
 */
export default function App() {
  // ─── Locations ──────────────────────────────────────────────────────────────
  const [sourcePath, setSourcePath] = usePersistentState(STORAGE_KEYS.sourcePath, "");
  const [destPath, setDestPath] = usePersistentState(STORAGE_KEYS.destPath, "");

  // ─── Rules, filters, and policy ─────────────────────────────────────────────
  const rules = useCategoryRules();
  const { categories, setCategories } = rules;
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [conflictResolution, setConflictResolution] = useState<ConflictResolution>("rename");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("manual");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(() => new Date());
  const [smartRenameEnabled, setSmartRenameEnabled] = useState(false);

  // ─── Chrome: search, panels, notices ────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [auditLogOpen, setAuditLogOpen] = useState(false);
  const [ruleBuilderOpen, setRuleBuilderOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = useCallback((message: string) => setNotice(message), []);

  // ─── AI command bar ─────────────────────────────────────────────────────────
  const [aiQuery, setAiQuery] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AiFeedback | null>(null);

  useSystemAccentColor();
  const isFullScreen = useFullScreen();

  /** Everything a run needs, derived from the settings above. */
  const config: OrganizerConfig = useMemo(
    () => ({
      sourcePath,
      destPath,
      categories,
      filters,
      conflictResolution,
      schedule: {
        enabled: scheduleType !== "manual",
        frequency: scheduleType,
        date: scheduleDate ?? null,
        time: scheduleTime,
      },
    }),
    [
      sourcePath,
      destPath,
      categories,
      filters,
      conflictResolution,
      scheduleType,
      scheduleDate,
      scheduleTime,
    ],
  );

  const pythonScript = useMemo(() => generatePythonScript(config), [config]);

  const run = useOrganizerRun({
    config,
    smartRenameEnabled,
    pythonScript,
    onNotice: showNotice,
  });

  // Keep the main process's cron job in step with the configured schedule.
  useEffect(() => {
    void window.electron?.saveSchedule?.(config);
  }, [config]);

  const insightData = useFolderInsights(sourcePath);
  const { startPreview } = run;
  const insights = useMemo(
    () =>
      buildInsightGroups({
        data: insightData,
        categories,
        onReview: () => void startPreview(),
      }),
    [insightData, categories, startPreview],
  );

  /** Category ids matching the search box, or null when the search is empty. */
  const searchMatches = useMemo<Set<string> | null>(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;
    return new Set(
      categories
        .filter(
          (category) =>
            category.name.toLowerCase().includes(query) ||
            category.extensions.some((extension) => extension.toLowerCase().includes(query)),
        )
        .map((category) => category.id),
    );
  }, [searchQuery, categories]);

  const browseForFolder = useCallback(async (): Promise<string | null> => {
    if (!window.electron) return null;
    try {
      return await window.electron.openDirectory();
    } catch {
      showNotice("Could not open the folder picker.");
      return null;
    }
  }, [showNotice]);

  const resetRules = useCallback(() => {
    rules.reset();
    setFilters(DEFAULT_FILTERS);
    setSearchQuery("");
  }, [rules]);

  /**
   * Merge an AI-parsed rule into the current settings and report which paths,
   * if any, it resolved.
   *
   * Shared by the inline command bar and the advanced rule builder, which
   * differ only in what they do afterwards.
   */
  const applyAiPatch = useCallback(
    (patch: AiRulePatch) => {
      setCategories((current) => applyCategoryPatch(current, patch));
      setFilters((current) => applyFilterPatch(current, patch));
      if (typeof patch.smartRename === "boolean") setSmartRenameEnabled(patch.smartRename);

      const nextSource = readPath(patch.sourcePath);
      const nextDest = readPath(patch.destPath);
      if (nextSource) setSourcePath(nextSource);
      if (nextDest) setDestPath(nextDest);

      return { nextSource, nextDest };
    },
    [setCategories, setSourcePath, setDestPath],
  );

  /** Send a natural-language rule to the parser and apply whatever comes back. */
  const submitAiQuery = useCallback(async () => {
    const query = aiQuery.trim();
    if (!query || aiBusy) return;

    if (!window.electron?.parseRule) {
      setAiFeedback({ type: "error", message: "AI rules are only available in the desktop app." });
      return;
    }

    setAiBusy(true);
    setAiFeedback(null);
    try {
      const result = await window.electron.parseRule(query, {
        categories,
        filters,
        smartRenameEnabled,
        sourcePath,
        destPath,
      });

      if (!result.success || !result.data) {
        setAiFeedback({
          type: "error",
          message: result.error || "AI couldn't process that. Try rephrasing.",
        });
        return;
      }

      const patch = result.data as AiRulePatch;
      const { nextSource, nextDest } = applyAiPatch(patch);
      setAiQuery("");

      // The state update above has not flushed yet, so the run is started with
      // the resolved path directly rather than reading it back from state.
      const effectiveSource = nextSource ?? sourcePath;
      if (patch.execute && effectiveSource) {
        setAiFeedback({ type: "success", message: `Running organizer on ${effectiveSource}…` });
        window.setTimeout(() => setAiFeedback(null), AI_FEEDBACK_TIMEOUT.running);
        void startPreview(effectiveSource);
      } else {
        const pathNote = nextSource || nextDest ? " Folders updated." : "";
        setAiFeedback({
          type: "success",
          message: `Rules updated!${pathNote} Review your settings above.`,
        });
        window.setTimeout(() => setAiFeedback(null), AI_FEEDBACK_TIMEOUT.success);
      }
    } catch {
      setAiFeedback({
        type: "error",
        message: "Couldn't reach AI. Check that GEMINI_API_KEY is set.",
      });
    } finally {
      setAiBusy(false);
    }
  }, [
    aiQuery,
    aiBusy,
    categories,
    filters,
    smartRenameEnabled,
    sourcePath,
    destPath,
    applyAiPatch,
    startPreview,
  ]);

  /** The advanced rule builder applies rules but never runs them immediately. */
  const submitBuilderRule = useCallback(
    async (rule: string) => {
      if (!window.electron?.parseRule) {
        showNotice("The AI Rule Builder is only available in the desktop app.");
        return;
      }
      try {
        const result = await window.electron.parseRule(rule, {
          categories,
          filters,
          smartRenameEnabled,
        });
        if (result.success && result.data) {
          applyAiPatch(result.data as AiRulePatch);
        } else {
          showNotice(`AI was unable to process your rule: ${result.error ?? "unknown error"}`);
        }
      } catch {
        showNotice("Error communicating with the AI parser. Make sure GEMINI_API_KEY is set.");
      }
    },
    [categories, filters, smartRenameEnabled, applyAiPatch, showNotice],
  );

  const operations = run.runMetrics.operations ?? [];
  const anyPanelOpen =
    run.previewOpen || ruleBuilderOpen || insightsOpen || auditLogOpen || notice !== null;

  useMenuActions({
    "open-preferences": () => window.dispatchEvent(new CustomEvent("tidy:open-preferences")),
    "run-tidy": () => void startPreview(),
    "reset-rules": resetRules,
    "open-source": () => void browseForFolder().then((dir) => dir && setSourcePath(dir)),
    "open-destination": () => void browseForFolder().then((dir) => dir && setDestPath(dir)),
    "toggle-insights": () => setInsightsOpen((open) => !open),
    "toggle-audit": () => setAuditLogOpen((open) => !open),
    "clear-search": () => {
      setSearchQuery("");
      setSearchOpen(false);
    },
    "undo-organize": () => void run.undo(operations),
  });

  useAppShortcuts(
    {
      onRun: () => void startPreview(),
      onUndo: () => void run.undo(operations),
      onOpenAuditLog: () => setAuditLogOpen((open) => !open),
    },
    { isModalOpen: anyPanelOpen, canUndo: operations.length > 0 },
  );

  return (
    <div
      className="h-screen overflow-hidden relative selection:bg-[var(--system-blue)]/30 selection:text-white bg-[var(--mac-window-background)] text-foreground"
      style={{ fontFamily: "var(--font-sf)" }}
    >
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>

      <LiveRegion
        runState={run.runState}
        runProgress={run.runProgress}
        metrics={run.runMetrics}
        aiBusy={aiBusy}
        aiFeedback={aiFeedback}
      />

      <div className="absolute top-0 left-0 right-0 z-30">
        <TopBar
          title="Tidy"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchOpen={searchOpen}
          onSearchOpenChange={setSearchOpen}
          runState={run.runState}
          progress={run.runProgress}
          onRunTidy={() => void startPreview()}
          isFullScreen={isFullScreen}
        >
          <AccessibilityPanel isCompact />
          <AuditLogToggleButton
            isOpen={auditLogOpen}
            onClick={() => setAuditLogOpen(!auditLogOpen)}
            isCompact
          />
          <InsightsToggleButton
            isOpen={insightsOpen}
            onClick={() => setInsightsOpen(!insightsOpen)}
            isCompact
          />
        </TopBar>

        <RunProgressBar runState={run.runState} progress={run.runProgress} />
      </div>

      <main
        id="main-content"
        tabIndex={-1}
        className="h-full w-full overflow-auto scroll-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--mac-focus-ring)]"
      >
        {/* Top padding clears the floating top bar; bottom padding clears the status bar. */}
        <div className="w-full px-5 lg:px-10 xl:px-16 pt-16 pb-44 flex flex-col gap-6">
          <LocationsSection
            sourcePath={sourcePath}
            destPath={destPath}
            onSourceChange={setSourcePath}
            onDestChange={setDestPath}
            onBrowse={browseForFolder}
          />

          <Divider />

          <FiltersSection filters={filters} onChange={setFilters} />

          <Divider />

          <RulesSection
            categories={categories}
            expandedIds={rules.expandedIds}
            enabledCount={rules.enabledCount}
            searchMatches={searchMatches}
            searchQuery={searchQuery}
            smartRenameEnabled={smartRenameEnabled}
            onSmartRenameToggle={() => setSmartRenameEnabled((enabled) => !enabled)}
            onToggleFeatureForAll={rules.toggleFeatureForAll}
            onToggleExpanded={rules.toggleExpanded}
            onPatchCategory={rules.updateCategory}
            onToggleExtension={rules.toggleExtension}
          />

          <AiCommandBar
            value={aiQuery}
            onValueChange={(value) => {
              setAiQuery(value);
              setAiFeedback(null);
            }}
            onSubmit={() => void submitAiQuery()}
            busy={aiBusy}
            feedback={aiFeedback}
            onOpenAdvanced={() => setRuleBuilderOpen(true)}
          />

          <Divider />

          <BottomPanel
            scheduleType={scheduleType}
            onScheduleTypeChange={setScheduleType}
            scheduleTime={scheduleTime}
            onScheduleTimeChange={setScheduleTime}
            scheduleDate={scheduleDate ?? null}
            onScheduleDateChange={setScheduleDate}
            conflictResolution={conflictResolution}
            onConflictResolutionChange={setConflictResolution}
          />
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-xl border-t border-black/[0.08] dark:border-white/[0.08] px-6 py-2">
        <StatusBar runState={run.runState} metrics={run.runMetrics} logEvents={run.logEvents} />
      </footer>

      <PreviewSheet
        isOpen={run.previewOpen}
        onClose={run.closePreview}
        onConfirm={run.confirmRun}
        categories={categories}
        runState={run.runState}
        runMetrics={run.runMetrics}
        runProgress={run.runProgress}
        files={run.previewFiles}
        smartRenameEnabled={smartRenameEnabled}
      />

      <NaturalLanguageRuleBuilder
        isOpen={ruleBuilderOpen}
        onClose={() => setRuleBuilderOpen(false)}
        onSave={submitBuilderRule}
      />

      <InsightsSidebar
        isOpen={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        insights={insights}
      />

      <AuditLogSidebar
        isOpen={auditLogOpen}
        onClose={() => setAuditLogOpen(false)}
        operations={operations}
        lastRunTime={run.runMetrics.timestamp}
        onUndo={run.undo}
        isUndoing={run.isUndoing}
      />

      <NoticeDialog
        open={notice !== null}
        onOpenChange={(open) => {
          if (!open) setNotice(null);
        }}
        message={notice ?? ""}
      />

      <Toaster position="top-center" richColors />
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-black/[0.04] dark:bg-white/[0.04]" aria-hidden="true" />;
}

/** A thin progress bar under the top bar while a scan or run is in flight. */
function RunProgressBar({ runState, progress }: { runState: RunState; progress: number }) {
  const active = runState === "scanning" || runState === "running";

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="progress-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-[52px] left-0 right-0 h-[2px] bg-black/5 dark:bg-white/5 z-20 overflow-hidden"
          role="progressbar"
          aria-label={runState === "scanning" ? "Scanning files…" : "Organizing files…"}
          aria-valuenow={runState === "scanning" ? undefined : progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {runState === "scanning" ? (
            // There is no file count during the scan, so the bar is indeterminate.
            <motion.div
              className="h-full w-1/3 bg-[var(--system-blue)] rounded-full"
              animate={{ x: ["-100%", "400%"] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : (
            <motion.div
              className="h-full bg-[var(--system-blue)]"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.25 }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface LiveRegionProps {
  runState: RunState;
  runProgress: number;
  metrics: { moved: number; renamed: number; duplicates: number; errors: number };
  aiBusy: boolean;
  aiFeedback: AiFeedback | null;
}

/** Announces run and AI status to VoiceOver, which cannot see the progress bar. */
function LiveRegion({ runState, runProgress, metrics, aiBusy, aiFeedback }: LiveRegionProps) {
  let message = "";

  if (runState === "scanning") {
    message = "Scanning files to organize…";
  } else if (runState === "running") {
    message = `Organizing files… ${Math.round(runProgress)}% complete`;
  } else if (runState === "completed") {
    message = `Organization complete. Moved ${metrics.moved}, renamed ${metrics.renamed}, and found ${metrics.duplicates} duplicates.`;
  } else if (runState === "error") {
    message = `Organization finished with errors. ${metrics.errors} errors encountered.`;
  } else if (aiBusy) {
    message = "AI is processing your request…";
  } else if (aiFeedback) {
    message = `AI ${aiFeedback.type}: ${aiFeedback.message}`;
  }

  return (
    <div aria-live="assertive" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
