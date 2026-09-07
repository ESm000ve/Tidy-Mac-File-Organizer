/**
 * Previewing, running, and reversing an organize job.
 */
import { ipcMain } from "electron";
import { CHANNELS } from "../channels";
import { scanFolderInsights } from "../services/insights";
import { runOrganizeJob, undoOperations } from "../services/organizer";
import { buildPreview } from "../services/preview";
import type { CategoryRule, LogLevel, Operation, OrganizeRequest } from "../types";

/** Wall-clock time for a log line, in the 24-hour format the status bar shows. */
function timestamp(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function registerOrganizeHandlers(): void {
  ipcMain.handle(CHANNELS.getFolderInsights, (_event, sourcePath: string) =>
    scanFolderInsights(sourcePath),
  );

  ipcMain.handle(
    CHANNELS.getFolderPreview,
    (_event, sourcePath: string, categories: CategoryRule[], smartRenameEnabled?: boolean) =>
      buildPreview(sourcePath, categories, smartRenameEnabled),
  );

  /**
   * Run the job, streaming progress and log lines back to the window that
   * started it so the UI can update while files are still moving.
   */
  ipcMain.handle(CHANNELS.organizeRun, (event, request: OrganizeRequest) =>
    runOrganizeJob(request, {
      onProgress: (progress) =>
        event.sender.send(CHANNELS.organizeProgress, { status: "running", progress }),
      onLog: (level: LogLevel, message: string) =>
        event.sender.send(CHANNELS.organizeLog, { level, message, time: timestamp() }),
    }),
  );

  ipcMain.handle(CHANNELS.organizeUndo, (_event, operations: Operation[]) =>
    undoOperations(operations),
  );
}
