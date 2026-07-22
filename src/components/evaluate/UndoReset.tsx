"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./UndoReset.module.css";

const CONFIRM_WINDOW_MS = 3000;

interface Props {
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
}

export default function UndoReset({ canUndo, onUndo, onReset }: Props) {
  const [confirming, setConfirming] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  function handleResetClick() {
    if (!confirming) {
      setConfirming(true);
      timeoutRef.current = setTimeout(() => setConfirming(false), CONFIRM_WINDOW_MS);
      return;
    }
    clearTimeout(timeoutRef.current);
    setConfirming(false);
    onReset();
  }

  return (
    <div className={styles.controls}>
      <button type="button" className={styles.button} disabled={!canUndo} onClick={onUndo}>
        Undo
      </button>
      <button
        type="button"
        className={`${styles.button} ${confirming ? styles.confirming : ""}`}
        onClick={handleResetClick}
      >
        {confirming ? "Tap again to reset" : "Reset"}
      </button>
    </div>
  );
}
