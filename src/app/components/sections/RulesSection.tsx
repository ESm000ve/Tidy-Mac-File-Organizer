import { clsx } from "clsx";
import { CategoryRuleCard } from "./CategoryRuleCard";
import { Copy, Sparkles, type Icon } from "../icons";
import type { Category } from "../../lib/generateScript";

interface RulesSectionProps {
  categories: Category[];
  expandedIds: Set<string>;
  enabledCount: number;
  /** Ids matching the current search, or null when no search is active. */
  searchMatches: Set<string> | null;
  searchQuery: string;
  smartRenameEnabled: boolean;
  onSmartRenameToggle: () => void;
  onToggleFeatureForAll: (feature: "smartCategorization" | "duplicateDetection") => void;
  onToggleExpanded: (id: string) => void;
  onPatchCategory: (id: string, patch: Partial<Category>) => void;
  onToggleExtension: (id: string, extension: string) => void;
}

/** The AI feature chips and the two-column grid of category rules. */
export function RulesSection({
  categories,
  expandedIds,
  enabledCount,
  searchMatches,
  searchQuery,
  smartRenameEnabled,
  onSmartRenameToggle,
  onToggleFeatureForAll,
  onToggleExpanded,
  onPatchCategory,
  onToggleExtension,
}: RulesSectionProps) {
  const smartSortOn = categories.some((category) => category.smartCategorization);
  const duplicatesOn = categories.some((category) => category.duplicateDetection);

  // Alternate categories between two columns so cards of differing heights
  // stay balanced as rules expand and collapse.
  const columns = [
    categories.filter((_, index) => index % 2 === 0),
    categories.filter((_, index) => index % 2 === 1),
  ];

  return (
    <section aria-label="File Rules" className="flex flex-col gap-3">
      <div className="flex items-center justify-between pl-1">
        <h2 className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/60">
          Automated Rules
        </h2>
        <span className="text-[13px] text-muted-foreground">
          {searchMatches ? `${searchMatches.size} matching` : `${enabledCount} active`}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-1" role="group" aria-label="AI-powered features">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--system-purple)]/60 flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3" aria-hidden="true" />
          AI
        </span>

        <FeatureChip
          id="ai-smart-rename-chip"
          icon={Sparkles}
          label="Smart Rename"
          tone="purple"
          active={smartRenameEnabled}
          onClick={onSmartRenameToggle}
          title="Use AI to generate better file names based on content and metadata"
        />
        <FeatureChip
          id="ai-smart-cat-chip"
          icon={Sparkles}
          label="Smart Sort"
          tone="purple"
          active={smartSortOn}
          onClick={() => onToggleFeatureForAll("smartCategorization")}
          title="Use AI to sort files into smart content-based subfolders (e.g. Screenshots, Invoices)"
        />
        <FeatureChip
          id="ai-dup-detect-chip"
          icon={Copy}
          label="Find Duplicates"
          tone="blue"
          active={duplicatesOn}
          onClick={() => onToggleFeatureForAll("duplicateDetection")}
          title="Detect and handle duplicate files across all categories"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="w-full md:flex-1 flex flex-col gap-4">
            {column.map((category) => (
              <CategoryRuleCard
                key={category.id}
                category={category}
                expanded={expandedIds.has(category.id)}
                matchesSearch={!searchMatches || searchMatches.has(category.id)}
                searching={searchMatches !== null}
                searchQuery={searchQuery}
                onToggleExpanded={() => onToggleExpanded(category.id)}
                onPatch={(patch) => onPatchCategory(category.id, patch)}
                onToggleExtension={(extension) => onToggleExtension(category.id, extension)}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

interface FeatureChipProps {
  id: string;
  icon: Icon;
  label: string;
  tone: "purple" | "blue";
  active: boolean;
  onClick: () => void;
  title: string;
}

/**
 * Tailwind needs to see complete class names at build time, so the active
 * styles per tone are written out rather than interpolated.
 */
const CHIP_ACTIVE_CLASSES: Record<FeatureChipProps["tone"], string> = {
  purple:
    "bg-[var(--system-purple)]/15 border-[var(--system-purple)]/30 text-[var(--system-purple)] font-medium",
  blue: "bg-[var(--system-blue)]/15 border-[var(--system-blue)]/30 text-[var(--system-blue)] font-medium",
};

const CHIP_DOT_CLASSES: Record<FeatureChipProps["tone"], string> = {
  purple: "bg-[var(--system-purple)]",
  blue: "bg-[var(--system-blue)]",
};

const CHIP_IDLE_CLASSES =
  "bg-black/5 dark:bg-white/[0.06] border-black/10 dark:border-white/10 text-foreground/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10";

/** A pill that turns one AI feature on or off across the whole rule set. */
function FeatureChip({ id, icon: ChipIcon, label, tone, active, onClick, title }: FeatureChipProps) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={title}
      className={clsx(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] border-[0.5px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mac-focus-ring)]",
        active ? CHIP_ACTIVE_CLASSES[tone] : CHIP_IDLE_CLASSES,
      )}
    >
      <ChipIcon className="w-3 h-3 shrink-0" aria-hidden="true" />
      {label}
      {active && (
        <span
          className={clsx("w-1.5 h-1.5 rounded-full ml-0.5", CHIP_DOT_CLASSES[tone])}
          aria-hidden="true"
        />
      )}
    </button>
  );
}
