import type { SectionBreakdown } from "@/lib/scoring";
import styles from "./QuickSummary.module.css";

interface Props {
  breakdown: SectionBreakdown[];
}

export default function QuickSummary({ breakdown }: Props) {
  if (breakdown.length === 0) return null;

  return (
    <section className={styles.card} aria-label="Quick summary by subject">
      <h2 className={styles.heading}>Quick Summary</h2>
      <ul className={styles.list}>
        {breakdown.map((section) => {
          const graded = section.c + section.w + section.u;
          const progressPercent =
            section.count > 0 ? Math.round((graded / section.count) * 100) : 0;
          return (
            <li key={section.name} className={styles.row}>
              <div className={styles.name}>
                <span
                  className={styles.dot}
                  style={{ backgroundColor: section.color }}
                  aria-hidden
                />
                {section.name}
              </div>
              <div className={styles.marks} data-numeric>
                {section.marks} / {section.maxM}
              </div>
              <div className={styles.counts}>
                <span title="Correct">✓ {section.c}</span>
                <span title="Incorrect">✗ {section.w}</span>
                <span title="Unattempted">– {section.u}</span>
              </div>
              <div
                className={styles.progressTrack}
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${section.name} progress`}
              >
                <div
                  className={styles.progressFill}
                  style={{ width: `${progressPercent}%`, backgroundColor: section.color }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
