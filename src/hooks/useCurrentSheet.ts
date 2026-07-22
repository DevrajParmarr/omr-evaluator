"use client";

import { useEffect, useRef, useState } from "react";
import { type CurrentSheet, loadCurrentSheet, saveCurrentSheet } from "@/lib/storage";

const SAVE_DEBOUNCE_MS = 400;

/**
 * Loads the in-progress sheet from localStorage on mount and debounce-writes changes
 * back to it. Hydrates lazily (starts with a fresh default sheet on the server/first
 * render) so this hook is safe to use in a client component without a hydration mismatch.
 */
export function useCurrentSheet(initial: CurrentSheet) {
  const [sheet, setSheet] = useState<CurrentSheet>(initial);
  const hydrated = useRef(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // Deliberately deferred to after mount: reading localStorage during render would
    // mismatch the server-prerendered HTML (which has no access to it).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSheet(loadCurrentSheet());
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveCurrentSheet(sheet), SAVE_DEBOUNCE_MS);
    return () => clearTimeout(saveTimeout.current);
  }, [sheet]);

  return [sheet, setSheet] as const;
}
