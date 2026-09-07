/**
 * Turning a sentence into organizer settings.
 *
 * The model returns a patch, not a command: it never touches the filesystem
 * itself, and the renderer decides what to do with what comes back.
 */
import os from "node:os";
import { ipcMain } from "electron";
import { CHANNELS } from "../channels";
import { GEMINI_MODEL, createClient } from "../services/gemini";
import type { CategoryRule } from "../types";

/** The organizer state sent along with the rule, so the model can patch it. */
interface RuleContext {
  categories: CategoryRule[];
  sourcePath?: string;
  destPath?: string;
}

function buildPrompt(rule: string, context: RuleContext): string {
  const homeDir = os.homedir();
  const categorySummary = JSON.stringify(
    context.categories.map(({ id, name, enabled, extensions }) => ({
      id,
      name,
      enabled,
      extensions,
    })),
    null,
    2,
  );

  return `You are an expert configuration parser for a File Organizer App.
The user wants to create a new rule or update settings using natural language.
User's Rule: "${rule}"

Current Categories context (to help you decide whether to update an existing category or create a new one):
${categorySummary}

Current source path: "${context.sourcePath ?? ""}"
Current dest path: "${context.destPath ?? ""}"
User's home directory: "${homeDir}"

Return a strict JSON response containing ONLY the updates required. Do not include markdown code blocks.
The exact JSON schema MUST be:
{
  "newCategories": [
    { "name": "Category Name", "extensions": ["ext1", "ext2"], "subfolders": boolean, "smartCategorization": boolean, "duplicateDetection": boolean }
  ],
  "updateCategories": [
    { "id": "existing-category-id", "enabled": boolean, "extensions": ["added_ext1"], "smartCategorization": boolean, "duplicateDetection": boolean }
  ],
  "updateFilters": {
    "fileSize": "any" | "small" | "medium" | "large",
    "dateModified": "any" | "today" | "week" | "month" | "year"
  },
  "smartRename": boolean,
  "sourcePath": "absolute path string or null",
  "destPath": "absolute path string or null",
  "execute": boolean
}

Rules:
1. If a field is not affected by the user's rule, omit it or set it to null.
2. Infer standard file extensions for requested categories (e.g. "Archive" usually means ["zip", "rar", "tar", "gz"], "Invoices" usually means ["pdf"]). Be thorough.
3. Never include periods in the extensions (e.g., use "pdf", not ".pdf").
4. If the user asks to "rename" or "smart rename" files, set "smartRename" to true.
5. If the user asks for a category but it already exists in the context, add the extensions to the existing category via updateCategories.
6. If the user mentions a source location (e.g. "my desktop", "Desktop", "Downloads", "Documents"), resolve it to an absolute path using the provided home directory. Common mappings: "desktop" -> "${homeDir}/Desktop", "downloads" -> "${homeDir}/Downloads", "documents" -> "${homeDir}/Documents", "pictures" -> "${homeDir}/Pictures", "movies" -> "${homeDir}/Movies", "music" -> "${homeDir}/Music".
7. If the user mentions a destination folder (e.g. "to the images folder on my desktop", "to a folder called X"), resolve it to an absolute path. If it is described as a subfolder of a known location, construct the full path (e.g. "images folder on my desktop" -> "${homeDir}/Desktop/Images").
8. Set "execute": true ONLY when the user clearly wants to immediately move/organize/run files right now (action verbs: "move", "organize", "clean up", "sort", "run", "put"). Set to false or omit when they are just configuring rules for future use.
9. If the user says something like "move X from Y to Z" or "move X on Y to Z", set sourcePath to Y's absolute path, destPath to Z's absolute path, and execute to true.
10. CRITICAL: If the user mentions a file type or category they want to move/organize (e.g. "images", "photos", "documents", "videos", "music"), you MUST include that category in updateCategories with "enabled": true. For example, if the user says "move images", find the matching category in the context and add { "id": "<that category's id>", "enabled": true } to updateCategories. If the category is already enabled, still include it to ensure it stays enabled.
11. If the user targets ONLY specific file types (e.g. "move images" — not "organize everything"), also add all OTHER categories to updateCategories with "enabled": false so only the targeted type gets moved.`;
}

export function registerRuleHandlers(): void {
  ipcMain.handle(CHANNELS.parseRule, async (_event, rule: string, context: RuleContext) => {
    const client = createClient();
    if (!client) {
      return {
        success: false,
        error: "GEMINI_API_KEY is not set. Add it to your .env file to use AI rules.",
      };
    }

    try {
      const response = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents: buildPrompt(rule, context),
        config: {
          responseMimeType: "application/json",
          // Rule parsing is a mechanical transformation; extra reasoning only
          // adds latency to what should feel instant.
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

      if (!response.text) return { success: false, error: "AI returned no content." };
      return { success: true, data: JSON.parse(response.text.trim()) };
    } catch (error) {
      console.error("Rule parsing failed.", error);
      const message = error instanceof Error ? error.message : "Failed to parse rule.";
      return { success: false, error: message };
    }
  });
}
