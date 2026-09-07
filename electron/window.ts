/**
 * The application window and the paths the renderer is loaded from.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BrowserWindow, nativeTheme } from "electron";
import { CHANNELS } from "./channels";

/** Set by Vite in development; absent in a packaged build. */
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

/** Window background colours, matched to the renderer's theme tokens so there
 *  is no light/dark flash between the window appearing and React painting. */
const BACKGROUND = { dark: "#1E1E1E", light: "#ECECEC" } as const;

const WINDOW_SIZE = { width: 1024, height: 768, minWidth: 800, minHeight: 600 } as const;

/** Directory of the bundled main process, used to locate the preload script. */
const MAIN_DIR = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;

function backgroundForAppearance(): string {
  return nativeTheme.shouldUseDarkColors ? BACKGROUND.dark : BACKGROUND.light;
}

/** The main window, or `null` if it has been closed. */
export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

/** Send a one-way event to the renderer, if a window is open. */
export function sendToRenderer(channel: string, ...args: unknown[]): void {
  mainWindow?.webContents.send(channel, ...args);
}

/** Create the application window and load the renderer into it. */
export function createWindow(rendererDist: string): BrowserWindow {
  mainWindow = new BrowserWindow({
    ...WINDOW_SIZE,
    titleBarStyle: "hiddenInset",
    acceptFirstMouse: true,
    backgroundColor: backgroundForAppearance(),
    webPreferences: {
      preload: path.join(MAIN_DIR, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      // The preload script uses Node built-ins, which the sandbox would block.
      // Context isolation still keeps the renderer off Node entirely.
      sandbox: false,
    },
  });

  nativeTheme.on("updated", () => {
    mainWindow?.setBackgroundColor(backgroundForAppearance());
  });

  if (VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    void mainWindow.loadFile(path.join(rendererDist, "index.html"));
  }

  // The renderer insets its top bar for the macOS traffic lights, which move
  // when the window enters full screen.
  mainWindow.on("enter-full-screen", () => sendToRenderer(CHANNELS.fullScreenChange, true));
  mainWindow.on("leave-full-screen", () => sendToRenderer(CHANNELS.fullScreenChange, false));
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  return mainWindow;
}
