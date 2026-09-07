/**
 * Filesystem helpers shared by the preview scan and the organize run.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import { promises as fsp } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { CategoryRule, RunFilters } from "../types";

/**
 * How much of a file is read to fingerprint it.
 *
 * Duplicate detection is a fast pre-filter, not forensic comparison: hashing
 * the first 64 KB alongside the exact byte length catches real duplicates
 * (copies, re-downloads) without reading gigabytes of video.
 */
const HASH_SAMPLE_BYTES = 64 * 1024;

const BYTES_PER_KB = 1024;
const BYTES_PER_MB = 1024 * 1024;

/** Age limits, in days, for each `dateModified` filter. */
const MAX_AGE_DAYS: Record<Exclude<RunFilters["dateModified"], "any">, number> = {
  today: 1,
  week: 7,
  month: 30,
  year: 365,
};

/** A size fingerprint for a file: a hash of its head plus its exact length. */
export async function fingerprintFile(filePath: string, sizeInBytes: number): Promise<string> {
  const handle = await fsp.open(filePath, "r");
  try {
    const buffer = Buffer.alloc(Math.min(sizeInBytes, HASH_SAMPLE_BYTES));
    await handle.read(buffer, 0, buffer.length, 0);
    return `${crypto.createHash("md5").update(buffer).digest("hex")}${sizeInBytes}`;
  } finally {
    await handle.close();
  }
}

/** Format a byte count the way the preview sheet displays it. */
export function formatBytes(bytes: number): string {
  if (bytes < BYTES_PER_KB) return `${bytes} B`;
  if (bytes < BYTES_PER_MB) return `${(bytes / BYTES_PER_KB).toFixed(1)} KB`;
  return `${(bytes / BYTES_PER_MB).toFixed(1)} MB`;
}

/** Replace the user's home directory with `~` for display. */
export function abbreviateHome(fullPath: string): string {
  const home = os.homedir();
  return home && fullPath.startsWith(home) ? `~${fullPath.slice(home.length)}` : fullPath;
}

/**
 * Build a lookup from `.ext` to the rule that claims it.
 *
 * When two rules list the same extension the later one wins, matching the
 * order the user sees in the rules grid.
 */
export function buildExtensionMap(
  categories: CategoryRule[],
  { enabledOnly = false } = {},
): Map<string, CategoryRule> {
  const map = new Map<string, CategoryRule>();
  for (const category of categories) {
    if (enabledOnly && !category.enabled) continue;
    for (const extension of category.extensions) {
      const normalized = (extension.startsWith(".") ? extension : `.${extension}`).toLowerCase();
      map.set(normalized, category);
    }
  }
  return map;
}

/** True when a file passes the run's date and size filters. */
export function passesFilters(stats: fs.Stats, filename: string, filters: RunFilters): boolean {
  if (filters.excludeHidden && filename.startsWith(".")) return false;

  if (filters.dateModified !== "any") {
    const ageInDays = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
    if (ageInDays > MAX_AGE_DAYS[filters.dateModified]) return false;
  }

  if (filters.fileSize !== "any") {
    const { size } = stats;
    if (filters.fileSize === "small" && size >= BYTES_PER_MB) return false;
    if (filters.fileSize === "medium" && (size < BYTES_PER_MB || size > 100 * BYTES_PER_MB)) {
      return false;
    }
    if (filters.fileSize === "large" && size <= 100 * BYTES_PER_MB) return false;
  }

  return true;
}

/**
 * Find a free path in `directory` for `filename`, appending " (1)", " (2)", …
 * until nothing is in the way.
 */
export function findAvailablePath(directory: string, filename: string): string {
  let candidate = path.join(directory, filename);
  if (!fs.existsSync(candidate)) return candidate;

  const extension = path.extname(filename);
  const base = path.basename(filename, extension);
  let counter = 1;
  while (fs.existsSync(candidate)) {
    candidate = path.join(directory, `${base} (${counter})${extension}`);
    counter += 1;
  }
  return candidate;
}

/**
 * Move a file, falling back to copy-then-delete across filesystem boundaries.
 *
 * `rename(2)` fails with `EXDEV` when the source and destination live on
 * different volumes, which is common when organizing from an external drive.
 */
export async function moveFile(from: string, to: string): Promise<void> {
  try {
    await fsp.rename(from, to);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EXDEV") throw error;
    await fsp.copyFile(from, to);
    await fsp.unlink(from);
  }
}
