/**
 * Building the preview: what a run *would* do, without touching anything.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import { promises as fsp } from "node:fs";
import path from "node:path";
import {
  abbreviateHome,
  buildExtensionMap,
  fingerprintFile,
  formatBytes,
} from "../lib/files";
import { cacheKey, getCachedRename, saveRenameCache, setCachedRename } from "./renameCache";
import { suggestRenames } from "./smartRename";
import type { CategoryRule, FileForRename, PreviewEntry, RenameSuggestion } from "../types";

/**
 * Preview is capped so a folder with thousands of files still opens promptly.
 * The run itself is not capped — it processes everything.
 */
const PREVIEW_FILE_LIMIT = 50;

/** Files per Smart Rename request. Batches are sent concurrently. */
const RENAME_BATCH_SIZE = 10;

/** Enumerate the files in `sourcePath` and describe what would happen to each. */
async function collectEntries(
  sourcePath: string,
  categories: CategoryRule[],
): Promise<PreviewEntry[]> {
  const extensionMap = buildExtensionMap(categories);
  const seenFingerprints = new Map<string, string>();
  const entries: PreviewEntry[] = [];

  const directory = await fsp.opendir(sourcePath);
  for await (const dirent of directory) {
    if (!dirent.isFile() || dirent.name.startsWith(".")) continue;

    const filename = dirent.name;
    const fullPath = path.join(sourcePath, filename);
    const stats = await fsp.stat(fullPath);
    const extension = path.extname(filename).toLowerCase();
    const category = extensionMap.get(extension);

    let isDuplicate = false;
    let duplicateOf: string | undefined;

    if (category?.duplicateDetection && stats.size > 0) {
      try {
        const fingerprint = await fingerprintFile(fullPath, stats.size);
        const original = seenFingerprints.get(fingerprint);
        if (original) {
          isDuplicate = true;
          duplicateOf = original;
        } else {
          seenFingerprints.set(fingerprint, filename);
        }
      } catch (error) {
        // An unreadable file is simply not compared; it still appears in the list.
        console.warn(`Could not fingerprint ${filename}.`, error);
      }
    }

    entries.push({
      id: crypto.randomUUID(),
      name: filename,
      ext: extension.slice(1),
      size: formatBytes(stats.size),
      sizeBytes: stats.size,
      from: abbreviateHome(sourcePath),
      path: fullPath,
      category: (category?.name ?? "Other").toLowerCase(),
      needsReview: false,
      isDuplicate,
      duplicateOf,
    });

    if (entries.length >= PREVIEW_FILE_LIMIT) break;
  }

  return entries;
}

/**
 * Attach AI rename suggestions to the entries, reusing cached results and
 * requesting the rest in concurrent batches.
 */
async function attachRenameSuggestions(entries: PreviewEntry[]): Promise<void> {
  const suggestions: Record<string, RenameSuggestion> = {};
  const pending: (FileForRename & { key: string })[] = [];

  for (const entry of entries) {
    const key = cacheKey(entry.name, entry.sizeBytes);
    const cached = getCachedRename(key);
    if (cached) {
      suggestions[entry.id] = cached;
    } else {
      pending.push({ id: entry.id, name: entry.name, path: entry.path, size: entry.sizeBytes, key });
    }
  }

  if (pending.length > 0) {
    const batches: Promise<void>[] = [];
    for (let index = 0; index < pending.length; index += RENAME_BATCH_SIZE) {
      const batch = pending.slice(index, index + RENAME_BATCH_SIZE);
      batches.push(
        suggestRenames(batch).then((batchSuggestions) => {
          for (const [fileId, suggestion] of Object.entries(batchSuggestions)) {
            suggestions[fileId] = suggestion;
            const source = batch.find((file) => file.id === fileId);
            if (source) setCachedRename(source.key, suggestion);
          }
        }),
      );
    }
    await Promise.all(batches);
    saveRenameCache();
  }

  for (const entry of entries) {
    const suggestion = suggestions[entry.id];
    // A suggestion identical to the current name is not worth showing.
    if (!suggestion || suggestion.suggested === entry.name) continue;
    entry.smartRename = {
      suggested: suggestion.suggested,
      reason: suggestion.reason || "AI generated suggestion",
      confidence: suggestion.confidence || "medium",
      subfolder: suggestion.subfolder,
    };
    entry.classSource = "ai";
  }
}

/**
 * Scan a folder and return what the preview sheet should show.
 *
 * Returns an empty list rather than throwing when the folder is missing or
 * unreadable: an empty preview is a clearer outcome than an error dialog.
 */
export async function buildPreview(
  sourcePath: string,
  categories: CategoryRule[],
  smartRenameEnabled = false,
): Promise<PreviewEntry[]> {
  if (!sourcePath || !fs.existsSync(sourcePath)) return [];

  try {
    const entries = await collectEntries(sourcePath, categories);
    if (smartRenameEnabled && entries.length > 0) {
      await attachRenameSuggestions(entries);
    }
    return entries;
  } catch (error) {
    console.error("Folder preview failed.", error);
    return [];
  }
}
