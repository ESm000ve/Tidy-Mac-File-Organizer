/**
 * IPC channel names, in one place.
 *
 * The main process registers handlers for these and the preload script invokes
 * them; a typo on either side is a runtime no-op, so both import from here.
 */
export const CHANNELS = {
  /** Renderer → main, request/response. */
  openDirectory: "dialog:openDirectory",
  previewFile: "dialog:previewFile",
  getFolderPreview: "dialog:getFolderPreview",
  getFolderInsights: "dialog:getFolderInsights",
  organizeRun: "organize:run",
  organizeUndo: "organize:undo",
  scheduleSave: "schedule:save",
  openFolder: "open:folder",
  parseRule: "ai:parseRule",
  getAccentColor: "system:getAccentColor",

  /** Main → renderer, one-way events. */
  organizeProgress: "organize:progress",
  organizeLog: "organize:log",
  menuAction: "menu:action",
  fullScreenChange: "window:fullscreen-change",
} as const;
