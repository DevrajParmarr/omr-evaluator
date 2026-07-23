export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Reads a resolved CSS custom property value, e.g. cssVar("--color-correct"). */
export function cssVar(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** A quick "press" pop — scales down then back up. Used for buttons and bubbles. */
export function popAnimation(el: Element | null): void {
  if (!el || prefersReducedMotion()) return;
  el.animate([{ transform: "scale(1)" }, { transform: "scale(0.92)" }, { transform: "scale(1)" }], {
    duration: 180,
    easing: "ease-out",
  });
}

/**
 * Flashes a color then eases back to transparent, so a button never looks stuck
 * highlighted after a tap (as opposed to :hover, which is a sustained state).
 */
export function flashAnimation(el: Element | null, color: string): void {
  if (!el || prefersReducedMotion() || !color) return;
  el.animate(
    [
      { backgroundColor: color, offset: 0 },
      { backgroundColor: "transparent", offset: 1 },
    ],
    { duration: 400, easing: "ease-out" },
  );
}

/** No-op when the Vibration API isn't supported (desktop browsers, iOS Safari). */
export function vibrate(pattern: number | number[] = 10): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}
