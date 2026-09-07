/**
 * System appearance queries.
 */
import { ipcMain, systemPreferences } from "electron";
import { CHANNELS } from "../channels";

export function registerSystemHandlers(): void {
  /**
   * The user's accent colour, so the app's controls match the rest of the
   * system. macOS-only; other platforms have no equivalent and get `null`.
   */
  ipcMain.handle(CHANNELS.getAccentColor, () =>
    process.platform === "darwin" ? systemPreferences.getAccentColor() : null,
  );
}
