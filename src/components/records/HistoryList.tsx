"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import type { SavedRecord } from "@/lib/records";
import EmptyState from "@/components/EmptyState";
import styles from "./HistoryList.module.css";

const CONFIRM_WINDOW_MS = 3000;

interface Props {
  records: SavedRecord[];
  onReopen: (record: SavedRecord) => void;
  onDelete: (id: string) => void;
}

export default function HistoryList({ records, onReopen, onDelete }: Props) {
  if (records.length === 0) {
    return (
      <section className={styles.card} aria-label="History">
        <h2 className={styles.heading}>History</h2>
        <EmptyState
          title="No saved attempts yet"
          description="Grade a sheet in Evaluate and save it to see it here."
        />
      </section>
    );
  }

  const sorted = [...records].sort((a, b) => b.savedAt.localeCompare(a.savedAt));

  return (
    <section className={styles.card} aria-label="History">
      <h2 className={styles.heading}>History</h2>
      <ul className={styles.list}>
        {sorted.map((record) => (
          <HistoryRow key={record.id} record={record} onReopen={onReopen} onDelete={onDelete} />
        ))}
      </ul>
    </section>
  );
}

function HistoryRow({
  record,
  onReopen,
  onDelete,
}: {
  record: SavedRecord;
  onReopen: (record: SavedRecord) => void;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function handleDeleteClick(event: React.MouseEvent) {
    event.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      timeoutRef.current = setTimeout(() => setConfirming(false), CONFIRM_WINDOW_MS);
      return;
    }
    clearTimeout(timeoutRef.current);
    onDelete(record.id);
  }

  const date = new Date(record.savedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <li className={styles.row}>
      <button type="button" className={styles.rowButton} onClick={() => onReopen(record)}>
        <div className={styles.rowMain}>
          <p className={styles.title}>{record.title || "Untitled"}</p>
          <p className={styles.meta}>
            {record.student && <>{record.student} · </>}
            {date}
          </p>
        </div>
        <div className={styles.rowStats}>
          <span className={styles.score} data-numeric>
            {record.score} / {record.maxMarks}
          </span>
          <span className={styles.counts}>
            ✓ {record.correct} ✗ {record.incorrect} – {record.unattempted} · {record.accuracy}%
          </span>
        </div>
      </button>
      <button
        type="button"
        className={`${styles.deleteButton} ${confirming ? styles.confirming : ""}`}
        aria-label={
          confirming
            ? `Confirm delete ${record.title || "Untitled"}`
            : `Delete ${record.title || "Untitled"}`
        }
        onClick={handleDeleteClick}
      >
        <Trash2 size={18} aria-hidden />
      </button>
    </li>
  );
}
