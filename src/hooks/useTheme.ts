"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "omr:theme";

// Keep in sync with the viewport.themeColor media-query pairs in layout.tsx — those
// cover the OS-matched case, this covers an explicit choice that diverges from the OS.
const THEME_COLOR: Record<Theme, string> = { light: "#e8e9e2", dark: "#17181b" };

function applyThemeColor(theme: Theme) {
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
}

function hasStoredTheme(): boolean {
  try {
    return (
      window.localStorage.getItem(STORAGE_KEY) === "light" ||
      window.localStorage.getItem(STORAGE_KEY) === "dark"
    );
  } catch {
    return false;
  }
}

/**
 * Reads the theme already applied to <html> by the inline anti-flash script in
 * layout.tsx (which runs before first paint), then lets the user toggle it.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from a DOM attribute the inline script already set, not deciding it here
    setTheme(current === "dark" ? "dark" : "light");

    // Until the user makes an explicit choice, keep following the OS preference live
    // (e.g. it flips at sunset) rather than freezing whatever happened to be true on load.
    if (hasStoredTheme()) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      const next: Theme = e.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      applyThemeColor(next);
      setTheme(next);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      applyThemeColor(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Preference just won't persist across reloads — not fatal.
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
