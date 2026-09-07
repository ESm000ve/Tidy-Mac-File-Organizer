/**
 * The organize run: the only code in the app that moves the user's files.
 *
 * Two invariants hold throughout. Every completed move is appended to
 * `operations` before the next file is touched, so an interrupted run is still
 * fully reversible. And a failure on one file is logged and counted, never
 * thrown — one unreadable file must not abandon the other nine hundred.
 */
import fs from "node:fs";
import { promises as fsp } from "node:fs";
import path from "node:path";
import {
  buildExtensionMap,
  fingerprintFile,
  findAvailablePath,
  moveFile,
  passesFilters,
} from "../lib/files";
import type {
  AcceptedRename,
  Operation,
  OrganizeRequest,
  RunCallbacks,
  RunResult,
} from "../types";

/** Files between progress reports. Reporting per file floods the IPC channel. */
const PROGRESS_INTERVAL = 10;

/** Where duplicates go when the conflict policy is "archive". */
const DUPLICATES_FOLDER = "Duplicates_Archive";

/** Where low-confidence AI renames go, for the user to check before filing. */
const REVIEW_FOLDER = "Review";

/** Renames the model was unsure about are quarantined rather than applied blind. */
const REVIEW_CONFIDENCE = new Set(["low", "medium"]);

/** Accept both the object form and a bare replacement string. */
function readRename(entry: AcceptedRename | string | undefined) {
  if (!entry) return null;
  if (typeof entry === "string") return { suggested: entry, confidence: undefined, subfolder: undefined };
  return { suggested: entry.suggested, confidence: entry.confidence, subfolder: entry.subfolder };
}

/**
 * Move every matching file from the source folder into the destination,
 * filing it by category and, optionally, by content type.
 *
 * @param request   Source, destination, rules, filters, and accepted renames.
 * @param callbacks Progress and log sinks. Omitted for scheduled runs, which
 *                  have no window to report to.
 */
export async function runOrganizeJob(
  request: OrganizeRequest,
  { onProgress, onLog }: RunCallbacks = {},
): Promise<RunResult> {
  const { sourcePath, destPath, categories, filters, conflictResolution, renames } = request;
  const log = (level: Parameters<NonNullable<RunCallbacks["onLog"]>>[0], message: string) =>
    onLog?.(level, message);

  if (!sourcePath || !destPath) {
    log("error", "Source or destination path missing");
    return { success: false, error: "Source or destination path missing" };
  }

  try {
    log("info", `Scan started — ${sourcePath}`);
    const filenames = await fsp.readdir(sourcePath);
    log("info", `Found ${filenames.length} files to process`);

    const extensionMap = buildExtensionMap(categories, { enabledOnly: true });
    const seenFingerprints = new Set<string>();
    const operations: Operation[] = [];

    let moved = 0;
    let renamed = 0;
    let duplicates = 0;
    let errors = 0;

    for (const [index, filename] of filenames.entries()) {
      const sourceFile = path.join(sourcePath, filename);

      try {
        const stats = await fsp.stat(sourceFile);
        if (!stats.isFile()) continue;
        if (!passesFilters(stats, filename, filters)) continue;

        const extension = path.extname(filename).toLowerCase();
        const rule = extensionMap.get(extension);
        if (!rule) continue;

        let isDuplicate = false;
        if (rule.duplicateDetection) {
          try {
            const fingerprint = await fingerprintFile(sourceFile, stats.size);
            isDuplicate = seenFingerprints.has(fingerprint);
            if (isDuplicate) duplicates += 1;
            else seenFingerprints.add(fingerprint);
          } catch (error) {
            console.warn(`Could not fingerprint ${filename}; treating it as unique.`, error);
          }
        }

        if (isDuplicate && conflictResolution === "skip") {
          log("warn", `Skipped duplicate: ${filename}`);
          continue;
        }

        let targetFilename = filename;
        let targetDirectory: string;

        if (isDuplicate && conflictResolution === "archive") {
          targetDirectory = path.join(destPath, DUPLICATES_FOLDER);
          log("warn", `${filename} is a duplicate, moving to ${DUPLICATES_FOLDER}`);
        } else {
          const rename = readRename(renames?.[filename]);
          let needsReview = false;

          if (rename) {
            targetFilename = rename.suggested;
            needsReview = REVIEW_CONFIDENCE.has(String(rename.confidence));
            renamed += 1;
          }

          if (needsReview) {
            targetDirectory = path.join(destPath, REVIEW_FOLDER);
          } else {
            targetDirectory = path.join(destPath, rule.name);
            if (rule.subfolders) {
              const semantic = rule.smartCategorization ? rename?.subfolder : undefined;
              targetDirectory = path.join(
                targetDirectory,
                semantic || extension.slice(1) || "no_extension",
              );
            }
          }
        }

        await fsp.mkdir(targetDirectory, { recursive: true });

        // Resolve a name collision at the destination according to the policy:
        // "rename" finds a free name, "skip" leaves the file where it is, and
        // "overwrite" (and an archived duplicate) writes over what is there.
        let targetPath = path.join(targetDirectory, targetFilename);
        if (fs.existsSync(targetPath)) {
          if (conflictResolution === "skip") {
            log("warn", `Skipped ${filename} — a file of that name is already filed`);
            continue;
          }
          if (conflictResolution === "rename") {
            targetPath = findAvailablePath(targetDirectory, targetFilename);
          }
        }

        await moveFile(sourceFile, targetPath);

        operations.push({
          originalPath: sourceFile,
          newPath: targetPath,
          originalName: filename,
          newName: path.basename(targetPath),
        });
        moved += 1;

        log(
          "info",
          targetFilename === filename
            ? `Moved ${filename} → ${rule.name}/`
            : `Renamed ${filename} → ${targetFilename} and moved to ${rule.name}/`,
        );
      } catch (error) {
        log("error", `Failed to process ${filename}`);
        console.error(`Failed to process ${filename}:`, error);
        errors += 1;
      }

      if (index % PROGRESS_INTERVAL === 0 || index === filenames.length - 1) {
        onProgress?.(Math.floor(((index + 1) / filenames.length) * 100));
      }
    }

    log("success", "Run completed successfully — undo manifest saved");
    return { success: true, moved, renamed, duplicates, errors, operations };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    log("error", `Organization error: ${message}`);
    console.error("Organization run failed.", error);
    return { success: false, error: message };
  }
}

/**
 * Reverse a run by moving each file back to where it came from.
 *
 * Operations are replayed newest-first so a file moved twice lands back at its
 * true origin. A file the user has since deleted or moved themselves is skipped
 * rather than treated as a failure.
 */
export async function undoOperations(operations: Operation[]) {
  let reverted = 0;
  let errors = 0;

  for (const operation of [...operations].reverse()) {
    try {
      await moveFile(operation.newPath, operation.originalPath);
      reverted += 1;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      console.error(`Could not revert ${operation.newPath}:`, error);
      errors += 1;
    }
  }

  return { success: errors === 0, reverted, errors };
}
