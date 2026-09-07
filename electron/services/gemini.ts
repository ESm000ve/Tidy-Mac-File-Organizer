/**
 * Access to the Gemini API.
 *
 * The key is read from `GEMINI_API_KEY` at call time rather than at module
 * load, so a `.env` edit takes effect on the next request instead of requiring
 * a restart. Callers must handle a `null` client: every AI feature has a
 * non-AI path, and a missing key is a normal state, not an error.
 */
import { GoogleGenAI } from "@google/genai";

/** Fast, cheap, and multimodal — the right trade-off for filename suggestions. */
export const GEMINI_MODEL = "gemini-2.5-flash";

export function getApiKey(): string | undefined {
  const key = process.env.GEMINI_API_KEY?.trim();
  return key || undefined;
}

/** A configured client, or `null` when no API key is set. */
export function createClient(): GoogleGenAI | null {
  const apiKey = getApiKey();
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
}
