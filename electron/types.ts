/**
 * Types used inside the main process.
 *
 * The renderer-facing contract lives in `src/electron.d.ts`; these are the
 * shapes the handlers and services pass among themselves.
 */

/** A category rule as configured in the UI. */
export interface CategoryRule {
  id: string;
  name: string;
  enabled: boolean;
  extensions: string[];
  subfolders: boolean;
  smartCategorization?: boolean;
  duplicateDetection?: boolean;
}

export interface RunFilters {
  dateModified: "any" | "today" | "week" | "month" | "year";
  fileSize: "any" | "small" | "medium" | "large";
  excludeHidden: boolean;
}

export type ConflictResolution = "rename" | "overwrite" | "skip" | "archive";

export interface ScheduleSettings {
  enabled: boolean;
  frequency: "manual" | "daily" | "weekly" | "monthly";
  date: string | Date | null;
  /** 24-hour "HH:MM". */
  time: string;
}

/** An AI rename the user accepted in the preview sheet, keyed by original name. */
export interface AcceptedRename {
  suggested: string;
  confidence?: string;
  subfolder?: string;
}

/** The full request for a run, as sent from the renderer. */
export interface OrganizeRequest {
  sourcePath: string;
  destPath: string;
  categories: CategoryRule[];
  filters: RunFilters;
  conflictResolution: ConflictResolution;
  schedule?: ScheduleSettings;
  renames?: Record<string, AcceptedRename>;
}

/** One completed move, recorded so the run can be reversed. */
export interface Operation {
  originalPath: string;
  newPath: string;
  originalName: string;
  newName: string;
}

export type LogLevel = "info" | "warn" | "error" | "success";

export interface RunCallbacks {
  onProgress?: (percent: number) => void;
  onLog?: (level: LogLevel, message: string) => void;
}

export interface RunResult {
  success: boolean;
  moved?: number;
  renamed?: number;
  duplicates?: number;
  errors?: number;
  error?: string;
  operations?: Operation[];
}

/** An AI rename suggestion for one file. */
export interface RenameSuggestion {
  suggested: string;
  reason: string;
  confidence: "high" | "medium" | "low";
  subfolder?: string;
}

/** The subset of file metadata the rename service needs. */
export interface FileForRename {
  id: string;
  name: string;
  path: string;
  /** Size in bytes. */
  size: number;
}

/** One row in the preview sheet. */
export interface PreviewEntry {
  id: string;
  name: string;
  ext: string;
  size: string;
  sizeBytes: number;
  from: string;
  path: string;
  category: string;
  needsReview: boolean;
  isDuplicate: boolean;
  duplicateOf?: string;
  smartRename?: RenameSuggestion;
  classSource?: "extension" | "metadata" | "ai";
}
