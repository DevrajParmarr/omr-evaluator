"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteRecord,
  exportBackupJSON,
  importBackupJSON,
  loadRecords,
  type ImportResult,
} from "@/lib/storage";
import type { SavedRecord } from "@/lib/records";

export function useRecords() {
  const [records, setRecords] = useState<SavedRecord[]>([]);

  useEffect(() => {
    // Deferred to after mount: localStorage isn't available during static prerendering.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecords(loadRecords());
  }, []);

  const remove = useCallback((id: string) => {
    setRecords(deleteRecord(id));
  }, []);

  const importFromJSON = useCallback((json: string): ImportResult => {
    const result = importBackupJSON(json);
    setRecords(loadRecords());
    return result;
  }, []);

  const exportJSON = useCallback(() => exportBackupJSON(), []);

  return { records, remove, importFromJSON, exportJSON };
}
