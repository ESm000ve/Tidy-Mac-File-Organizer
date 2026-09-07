/**
 * Main process entry point.
 *
 * This file does bootstrap only — environment, lifecycle, and wiring. The work
 * lives in `./services` (what the app does), `./ipc` (what the renderer may
 * ask for), `./menu`, and `./window`.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { app, BrowserWindow } from "electron";
import * as dotenv from "dotenv";
import { registerIpcHandlers } from "./ipc";
import { setupMenu } from "./menu";
import { loadRenameCache } from "./services/renameCache";
import { VITE_DEV_SERVER_URL, createWindow, getMainWindow } from "./window";

// Loads GEMINI_API_KEY from .env in development. In a packaged build the key
// comes from the real environment; a missing key is handled, not fatal.
dotenv.config();

const MAIN_DIR = path.dirname(fileURLToPath(import.meta.url));

/** Project root at runtime: one level above the bundled main process. */
const APP_ROOT = path.join(MAIN_DIR, "..");

/** Built renderer assets, loaded directly from disk in a packaged build. */
const RENDERER_DIST = path.join(APP_ROOT, "dist");

const REPOSITORY_URL = "https://github.com/ericauzenne/tidy";

process.env.APP_ROOT = APP_ROOT;
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(APP_ROOT, "public") : RENDERER_DIST;

function configureAboutPanel(): void {
  if (process.platform !== "darwin") return;
  app.setAboutPanelOptions({
    applicationName: "Tidy",
    applicationVersion: app.getVersion(),
    copyright: `Copyright © ${new Date().getFullYear()} Eric Auzenne`,
  });
}

void app.whenReady().then(() => {
  loadRenameCache();
  configureAboutPanel();
  registerIpcHandlers();
  createWindow(RENDERER_DIST);
  setupMenu({ repositoryUrl: REPOSITORY_URL });
});

// On macOS an app stays running with no windows open; elsewhere, closing the
// last window quits.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow(RENDERER_DIST);
  else getMainWindow()?.focus();
});
