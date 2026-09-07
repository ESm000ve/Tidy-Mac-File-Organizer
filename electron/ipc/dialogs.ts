/**
 * Folder pickers, Quick Look previews, and revealing folders in Finder.
 */
import { BrowserWindow, dialog, ipcMain, shell } from "electron";
import { CHANNELS } from "../channels";
import { getMainWindow } from "../window";

/**
 * Quick Look refuses to switch files while a panel is open, so the existing
 * panel is closed and the next opened on the following tick.
 */
const PREVIEW_SWITCH_DELAY_MS = 50;

export function registerDialogHandlers(): void {
  ipcMain.handle(CHANNELS.openDirectory, async () => {
    const window = getMainWindow();
    if (!window) return null;

    const { canceled, filePaths } = await dialog.showOpenDialog(window, {
      properties: ["openDirectory", "createDirectory"],
    });
    return canceled ? null : (filePaths[0] ?? null);
  });

  /** Show a file in the macOS Quick Look panel. */
  ipcMain.handle(CHANNELS.previewFile, (event, filePath: string) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return;

    window.closeFilePreview();
    setTimeout(() => window.previewFile(filePath), PREVIEW_SWITCH_DELAY_MS);
  });

  /** Reveal a folder in the system file manager. */
  ipcMain.handle(CHANNELS.openFolder, async (_event, folderPath: string) => {
    // `openPath` resolves with an error *string*, not a rejection.
    const error = await shell.openPath(folderPath);
    if (error) {
      console.error(`Could not open ${folderPath}:`, error);
      return { success: false, error };
    }
    return { success: true };
  });
}
