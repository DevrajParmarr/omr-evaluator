"use client";

import { useRef } from "react";
import { Download, Upload } from "lucide-react";
import styles from "./BackupControls.module.css";

interface Props {
  onExport: () => void;
  onImportFile: (file: File) => void;
}

export default function BackupControls({ onExport, onImportFile }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.controls}>
      <button type="button" className={styles.button} onClick={onExport}>
        <Download size={16} aria-hidden /> Export backup
      </button>
      <button type="button" className={styles.button} onClick={() => fileInputRef.current?.click()}>
        <Upload size={16} aria-hidden /> Import backup
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImportFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
