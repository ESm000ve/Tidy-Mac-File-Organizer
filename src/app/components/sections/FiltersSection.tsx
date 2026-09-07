import { MacSelect, type SelectOption } from "../controls/MacSelect";
import { MacToggle } from "../controls/MacToggle";
import { GLASS_SURFACE } from "../../constants";
import type { DateFilter, Filters, SizeFilter } from "../../types";

const DATE_OPTIONS: readonly SelectOption<DateFilter>[] = [
  { value: "any", label: "Any Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];

const SIZE_OPTIONS: readonly SelectOption<SizeFilter>[] = [
  { value: "any", label: "Any Size" },
  { value: "small", label: "Small  (< 1 MB)" },
  { value: "medium", label: "Medium  (1 MB – 100 MB)" },
  { value: "large", label: "Large  (> 100 MB)" },
];

interface FiltersSectionProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

/** Which files a run considers, before category rules are applied. */
export function FiltersSection({ filters, onChange }: FiltersSectionProps) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <section aria-label="Filters" className="flex flex-col gap-3">
      <h2 className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/60">
        Smart Filters
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${GLASS_SURFACE} p-4`}>
          <MacSelect
            label="Date Modified"
            value={filters.dateModified}
            onChange={(value) => set("dateModified", value)}
            options={DATE_OPTIONS}
          />
        </div>

        <div className={`${GLASS_SURFACE} p-4`}>
          <MacSelect
            label="File Size"
            value={filters.fileSize}
            onChange={(value) => set("fileSize", value)}
            options={SIZE_OPTIONS}
          />
        </div>

        <div className={`${GLASS_SURFACE} p-4 flex items-center justify-between gap-4`}>
          <div className="min-w-0">
            <p className="text-[14px] text-foreground/90" id="exclude-hidden-label">
              Exclude Hidden
            </p>
            <p className="text-[13px] text-muted-foreground mt-0.5" id="exclude-hidden-desc">
              Skip dot-files (e.g. .DS_Store)
            </p>
          </div>
          <MacToggle
            checked={filters.excludeHidden}
            onCheckedChange={(value) => set("excludeHidden", value)}
            aria-labelledby="exclude-hidden-label"
            aria-describedby="exclude-hidden-desc"
          />
        </div>
      </div>
    </section>
  );
}
