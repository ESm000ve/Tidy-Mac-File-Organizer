/**
 * The native menu bar and Dock menu.
 *
 * Menu items do not act directly: each sends a {@link MenuAction} to the
 * renderer, which owns the state the action affects. That keeps one
 * implementation of "run Tidy" rather than a menu copy and a button copy.
 */
import { app, Menu, shell, type MenuItemConstructorOptions } from "electron";
import { CHANNELS } from "./channels";
import { sendToRenderer } from "./window";

/** Actions the renderer knows how to handle. Mirrors `MenuAction` there. */
type MenuAction =
  | "open-preferences"
  | "run-tidy"
  | "reset-rules"
  | "open-source"
  | "open-destination"
  | "toggle-insights"
  | "toggle-audit"
  | "clear-search"
  | "undo-organize";

interface MenuOptions {
  /** Repository URL used by the Help menu. */
  repositoryUrl: string;
}

const isMac = process.platform === "darwin";

function dispatch(action: MenuAction) {
  return () => sendToRenderer(CHANNELS.menuAction, action);
}

function buildTemplate({ repositoryUrl }: MenuOptions): MenuItemConstructorOptions[] {
  // The app menu holds only app-global items. Task actions live under Actions,
  // per the macOS HIG.
  const appMenu: MenuItemConstructorOptions[] = isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: "about" },
            { type: "separator" },
            // ⌘, is the system-standard Preferences shortcut.
            { label: "Preferences…", accelerator: "CmdOrCtrl+,", click: dispatch("open-preferences") },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
      ]
    : [];

  const editMacExtras: MenuItemConstructorOptions[] = isMac
    ? [
        { role: "pasteAndMatchStyle" },
        { role: "delete" },
        { role: "selectAll" },
        { type: "separator" },
        { label: "Speech", submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }] },
      ]
    : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }];

  // Developer tools are gated on the packaged flag so they never ship.
  const developerItems: MenuItemConstructorOptions[] = app.isPackaged
    ? []
    : [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
      ];

  return [
    ...appMenu,
    {
      label: "File",
      submenu: [
        { label: "Select Source Folder…", accelerator: "CmdOrCtrl+O", click: dispatch("open-source") },
        {
          // ⌘⇧O rather than ⌘D: ⌘D is "Don't Save" in macOS dialogs.
          label: "Select Destination Folder…",
          accelerator: "CmdOrCtrl+Shift+O",
          click: dispatch("open-destination"),
        },
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" },
      ],
    },
    {
      label: "Actions",
      submenu: [
        { label: "Run Tidy", accelerator: "CmdOrCtrl+Return", click: dispatch("run-tidy") },
        // Deliberately without a shortcut: it discards the user's whole rule set.
        { label: "Reset All Rules…", click: dispatch("reset-rules") },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { label: "Undo Last Organize", accelerator: "CmdOrCtrl+Z", click: dispatch("undo-organize") },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        ...editMacExtras,
      ],
    },
    {
      label: "View",
      submenu: [
        { label: "Show Insights", accelerator: "CmdOrCtrl+I", click: dispatch("toggle-insights") },
        { label: "Show Audit Log", accelerator: "CmdOrCtrl+L", click: dispatch("toggle-audit") },
        { type: "separator" },
        { label: "Clear Search", accelerator: "CmdOrCtrl+K", click: dispatch("clear-search") },
        { type: "separator" },
        ...developerItems,
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: isMac
        ? [
            { role: "minimize" },
            { role: "zoom" },
            { type: "separator" },
            { role: "front" },
            { type: "separator" },
            { role: "window" },
          ]
        : [{ role: "minimize" }, { role: "zoom" }, { role: "close" }],
    },
    {
      role: "help",
      submenu: [
        { label: "Learn More", click: () => void shell.openExternal(repositoryUrl) },
        { label: "Documentation", click: () => void shell.openExternal(`${repositoryUrl}#readme`) },
        { type: "separator" },
        { label: "Report an Issue", click: () => void shell.openExternal(`${repositoryUrl}/issues`) },
      ],
    },
  ];
}

/** Install the application menu and, on macOS, the Dock menu. */
export function setupMenu(options: MenuOptions): void {
  Menu.setApplicationMenu(Menu.buildFromTemplate(buildTemplate(options)));

  if (isMac && app.dock) {
    app.dock.setMenu(
      Menu.buildFromTemplate([
        { label: "Run Tidy", click: dispatch("run-tidy") },
        { label: "Open Source Folder", click: dispatch("open-source") },
      ]),
    );
  }
}
