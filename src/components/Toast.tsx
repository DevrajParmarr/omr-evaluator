"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { animate } from "motion/mini";
import { prefersReducedMotion } from "@/lib/motion";
import styles from "./Toast.module.css";

export type ToastType = "success" | "error" | "info";

export interface ToastData {
  message: string;
  type: ToastType;
}

interface Props {
  toast: ToastData | null;
}

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const;

export default function Toast({ toast }: Props) {
  const [rendered, setRendered] = useState<ToastData | null>(toast);
  const [prevToast, setPrevToast] = useState<ToastData | null>(toast);
  const toastRef = useRef<HTMLParagraphElement>(null);

  // Adjusting state during render (React's documented pattern for deriving state from a prop
  // change) so a new toast paints immediately — a null `toast` intentionally does NOT clear
  // `rendered` here, since the effect below needs the old content to stay mounted while its
  // exit animation plays.
  if (toast !== prevToast) {
    setPrevToast(toast);
    if (toast) setRendered(toast);
  }

  useEffect(() => {
    const el = toastRef.current;

    if (toast) {
      if (el && !prefersReducedMotion()) {
        animate(
          el,
          { opacity: [0, 1], y: [10, 0] },
          { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
        );
      }
      return;
    }

    if (!rendered || !el) return;
    const duration = prefersReducedMotion() ? 0 : 0.2;
    animate(el, { opacity: [1, 0], y: [0, 10] }, { duration, ease: "easeIn" }).then(() =>
      setRendered(null),
    );
  }, [toast, rendered]);

  const Icon = rendered && ICONS[rendered.type];

  return (
    <div className={styles.wrapper} aria-live="polite" role="status">
      {rendered && Icon && (
        <p
          key={`${rendered.type}:${rendered.message}`}
          ref={toastRef}
          className={`${styles.toast} ${styles[rendered.type]}`}
        >
          <Icon size={18} className={styles.icon} aria-hidden="true" />
          {rendered.message}
        </p>
      )}
    </div>
  );
}
