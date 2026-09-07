/**
 * On-disk cache of AI rename suggestions.
 *
 * Suggestions cost an API call each, and previewing the same folder twice is
 * common, so results are keyed by name and size and persisted between launches.
 * Including the size means an edited file is re-analysed rather than served a
 * suggestion describing its old contents.
 */
import fs from "node:fs";
import path from "node:path";
import { app } from "electron";
import type { RenameSuggestion } from "../types";

const CACHE_FILENAME = ".file-organizer-cache.json";

let cache = new Map<string, RenameSuggestion>();
let cachePath = "";

/** Cache key for a file. Must be stable across runs. */
export function cacheKey(name: string, sizeBytes: number): string {
  return `${name}|${sizeBytes}`;
}

/** Load the cache from the user-data directory. Call once, after `app.whenReady`. */
export function loadRenameCache(): void {
  cachePath = path.join(app.getPath("userData"), CACHE_FILENAME);
  try {
    if (!fs.existsSync(cachePath)) return;
    const parsed = JSON.parse(fs.readFileSync(cachePath, "utf-8")) as Record<string, RenameSuggestion>;
    cache = new Map(Object.entries(parsed));
  } catch (error) {
    // A corrupt cache is not worth blocking launch over; start empty.
    console.warn("Could not read the rename cache; starting fresh.", error);
  }
}

export function getCachedRename(key: string): RenameSuggestion | undefined {
  return cache.get(key);
}

export function setCachedRename(key: string, suggestion: RenameSuggestion): void {
  cache.set(key, suggestion);
}

/** Persist the cache. Called once per preview scan, not once per suggestion. */
export function saveRenameCache(): void {
  if (!cachePath) return;
  try {
    fs.writeFileSync(cachePath, JSON.stringify(Object.fromEntries(cache), null, 2));
  } catch (error) {
    console.warn("Could not write the rename cache.", error);
  }
}
