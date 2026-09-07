/**
 * Suggesting better filenames.
 *
 * With an API key, file contents go to Gemini, which names images and documents
 * from what they actually contain. Without one, a set of local patterns still
 * cleans up the most common machine-generated names — so Smart Rename degrades
 * to something useful rather than switching off.
 */
import { promises as fsp } from "node:fs";
import path from "node:path";
import type { FileForRename, RenameSuggestion } from "../types";
import { GEMINI_MODEL, createClient } from "./gemini";

/**
 * Largest file sent inline to the model. Above this the filename alone is used:
 * uploading tens of megabytes costs more time than the better name is worth.
 */
const MAX_INLINE_BYTES = 512 * 1024;

/** MIME types the model can read directly. Anything else goes by name only. */
const INLINE_MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".md": "text/plain",
};

const PROMPT = `
You are an expert file organizer utility. Analyze the following list of files.
For images and documents, I am providing their binary content when possible. For other files, use just the filename to deduce context.
Provide a highly descriptive, human-readable "smart" filename for EACH file.

Crucial Instruction:
You MUST attempt to extract visual or textual context from the file contents (e.g., if an image shows a dog in a park, name it "Golden_Retriever_Dog_Park.jpg").
Do NOT just return the original name. Even if the original name is somewhat organized (like "2024-01-01_Screenshot.jpg"), you MUST look at the image content and rename it to describe what is actually in the image (e.g. "2024-01-01_Recipe_For_Pie.jpg").
You must also classify each file into a logical, semantic "subfolder" based on its content (e.g., "Screenshots", "Photos", "Scans", "Invoices", "Receipts", "Contracts", "Memes", etc). Keep subfolder names brief and capitalized.

Guidelines for new names:
- Use visual/content context if provided.
- Clean up junk characters but keep extensions exactly the same.
- Use dashes or underscores for spaces.
- Keep output strictly as clean JSON.

Return a JSON object where the key is the file ID, and the value is an object containing:
- "suggested": The new clean filename (MUST include the original extension).
- "reason": A brief 1-sentence reason why you changed it.
- "confidence": "high", "medium", or "low".
- "subfolder": A short semantic category string (e.g. "Screenshots", "Invoices").

Files to analyze:`;

/**
 * Patterns for filenames a device generated rather than a person chose.
 *
 * Each rule matches a family of machine names and says how to rewrite it. They
 * are tried in order, so the most specific come first.
 */
const HEURISTICS: {
  test: RegExp;
  confidence: RenameSuggestion["confidence"];
  subfolder: string;
  reason: string;
  rename: (stem: string, extension: string, today: string) => string;
}[] = [
  {
    // macOS screenshots: "Screen Shot 2024-01-01 at 10.30.00".
    test: /^Screen\s?shot\s+(.+)$/i,
    confidence: "high",
    subfolder: "Screenshots",
    reason: "Standardized screenshot format",
    rename: (stem, extension) => {
      const timestamp = stem
        .replace(/^Screen\s?shot\s+/i, "")
        .replace(/\s+at\s+/gi, "_")
        .replace(/[:\s.]+/g, "-");
      return `${timestamp}_Screenshot${extension}`;
    },
  },
  {
    test: /^(IMG|DSC|P|IMAGE|PHOTO)_?\d+/i,
    confidence: "medium",
    subfolder: "Photos",
    reason: "Standardized camera image name",
    rename: (stem, extension, today) => `${today}_Capture_${stem}${extension}`,
  },
  {
    test: /^(Document|Scan|Untitled|New Document|Report|Draft)_?\d*/i,
    confidence: "medium",
    subfolder: "Documents",
    reason: "Prepend date to generic document",
    rename: (stem, extension, today) => `${today}_Doc_${stem}${extension}`,
  },
  {
    test: /^(Voice|Track|Audio|Rec|Recording)_?\d+/i,
    confidence: "medium",
    subfolder: "Audio",
    reason: "Standardized audio recording name",
    rename: (stem, extension, today) => `${today}_Audio_${stem}${extension}`,
  },
  {
    test: /^(MOV|VID|VIDEO|Clip)_?\d+/i,
    confidence: "medium",
    subfolder: "Video",
    reason: "Standardized video name",
    rename: (stem, extension, today) => `${today}_Video_${stem}${extension}`,
  },
  {
    test: /^(File|Download|Data|Export|Backup)_?\d*/i,
    confidence: "low",
    subfolder: "Other",
    reason: "Prepend date to generic download/export",
    rename: (stem, extension, today) => `${today}_${stem}${extension}`,
  },
];

/**
 * Offline fallback: rewrite recognisably machine-generated names.
 *
 * Files that already have a human-chosen name are left alone — no suggestion is
 * better than a worse name.
 */
export function suggestRenamesLocally(files: FileForRename[]): Record<string, RenameSuggestion> {
  const today = new Date().toISOString().split("T")[0];
  const suggestions: Record<string, RenameSuggestion> = {};

  for (const file of files) {
    const extension = path.extname(file.name);
    const stem = file.name.slice(0, file.name.length - extension.length);

    const rule = HEURISTICS.find((candidate) => candidate.test.test(stem));
    if (!rule) continue;

    suggestions[file.id] = {
      suggested: rule.rename(stem, extension, today),
      reason: rule.reason,
      confidence: rule.confidence,
      subfolder: rule.subfolder,
    };
  }

  return suggestions;
}

/** Build the multimodal request body, inlining file contents where practical. */
async function buildRequestParts(files: FileForRename[]) {
  const parts: ({ text: string } | { inlineData: { data: string; mimeType: string } })[] = [
    { text: PROMPT },
  ];

  for (const file of files) {
    parts.push({ text: `\n\nFile ID: ${file.id}\nOriginal Name: ${file.name}` });

    const mimeType = INLINE_MIME_TYPES[path.extname(file.name).toLowerCase()];
    if (!mimeType || file.size >= MAX_INLINE_BYTES) continue;

    try {
      const contents = await fsp.readFile(file.path);
      parts.push({ inlineData: { data: contents.toString("base64"), mimeType } });
    } catch (error) {
      // An unreadable file still gets a name-only suggestion.
      console.warn(`Could not inline ${file.name} for analysis.`, error);
    }
  }

  parts.push({ text: "\n\nEnd of files. Provide the JSON dictionary." });
  return parts;
}

/**
 * Suggest names for one batch of files.
 *
 * Falls back to {@link suggestRenamesLocally} when no API key is configured, and
 * returns an empty object if the request fails — a failed suggestion must never
 * fail the surrounding scan.
 */
export async function suggestRenames(
  files: FileForRename[],
): Promise<Record<string, RenameSuggestion>> {
  const client = createClient();
  if (!client) return suggestRenamesLocally(files);

  try {
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: await buildRequestParts(files),
      config: { responseMimeType: "application/json" },
    });
    return JSON.parse(response.text || "{}") as Record<string, RenameSuggestion>;
  } catch (error) {
    console.error("Smart Rename request failed; falling back to local heuristics.", error);
    return suggestRenamesLocally(files);
  }
}
