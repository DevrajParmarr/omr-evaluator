"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ToastData, ToastType } from "@/components/Toast";

const TOAST_DURATION_MS = 2500;

export function useToast() {
  const [toast, setToast] = useState<ToastData | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    clearTimeout(timeoutRef.current);
    setToast({ message, type });
    timeoutRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  return { toast, showToast };
}
