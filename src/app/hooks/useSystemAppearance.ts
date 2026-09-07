import { useEffect, useState } from "react";

/**
 * Adopt the user's macOS accent colour as the app's `--system-blue`.
 *
 * Runs once at launch. Off macOS, or in a browser, the main process returns
 * `null` and the stylesheet default stands.
 */
export function useSystemAccentColor(): void {
  useEffect(() => {
    if (!window.electron?.getAccentColor) return;
    let applied = true;

    window.electron
      .getAccentColor()
      .then((color) => {
        if (!applied || !color) return;
        const hex = color.startsWith("#") ? color : `#${color}`;
        document.documentElement.style.setProperty("--system-blue", hex);
      })
      .catch(() => {
        // Keep the stylesheet default.
      });

    return () => {
      applied = false;
    };
  }, []);
}

/** Track whether the window is in macOS full screen, to adjust top-bar insets. */
export function useFullScreen(): boolean {
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (!window.electron?.onFullScreenChange) return;
    return window.electron.onFullScreenChange(setIsFullScreen);
  }, []);

  return isFullScreen;
}
