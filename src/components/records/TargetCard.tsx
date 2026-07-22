import type { ExamType } from "@/lib/presets";
import type { TargetProgress } from "@/lib/analytics";
import styles from "./TargetCard.module.css";

const SUGGESTED_TARGET: Partial<Record<ExamType, number>> = {
  jee: 250,
};

interface Props {
  examType: ExamType;
  progress: TargetProgress;
  onTargetChange: (target: number | null) => void;
}

export default function TargetCard({ examType, progress, onTargetChange }: Props) {
  const suggestion = SUGGESTED_TARGET[examType];

  return (
    <section className={styles.card} aria-label="Target score">
      <div className={styles.row}>
        <h2 className={styles.heading}>Target</h2>
        <label className={styles.field}>
          <span className="sr-only">Target score</span>
          <input
            type="number"
            data-numeric
            placeholder={suggestion ? `e.g. ${suggestion}` : "Goal"}
            value={progress.target ?? ""}
            onChange={(e) => onTargetChange(e.target.value === "" ? null : Number(e.target.value))}
          />
        </label>
      </div>

      {progress.target !== null && (
        <>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuenow={progress.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progress toward target"
          >
            <div
              className={styles.progressFill}
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
          <p className={styles.status}>
            {progress.reached ? "🎯 Target reached" : `${progress.remaining} to go`}
          </p>
        </>
      )}
    </section>
  );
}
