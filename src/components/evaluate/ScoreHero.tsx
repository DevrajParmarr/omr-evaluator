import { useEffect, useRef } from "react";
import { popAnimation } from "@/lib/motion";
import styles from "./ScoreHero.module.css";

interface Props {
  score: number;
  maxMarks: number;
  graded: number;
  totalQ: number;
  nextQNumber: number;
  nextSectionName: string | undefined;
  isComplete: boolean;
}

export default function ScoreHero({
  score,
  maxMarks,
  graded,
  totalQ,
  nextQNumber,
  nextSectionName,
  isComplete,
}: Props) {
  const progressPercent = totalQ > 0 ? Math.min(100, Math.round((graded / totalQ) * 100)) : 0;
  const scoreRef = useRef<HTMLParagraphElement>(null);
  const previousScore = useRef(score);

  useEffect(() => {
    if (previousScore.current !== score) {
      popAnimation(scoreRef.current);
      previousScore.current = score;
    }
  }, [score]);

  return (
    <section className={styles.hero} aria-label="Score">
      <p className={styles.label}>Total Score</p>

      <p ref={scoreRef} className={styles.score} data-numeric aria-live="polite">
        {score} <span className={styles.max}>/ {maxMarks}</span>
      </p>

      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Grading progress"
      >
        <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
      </div>

      <p className={styles.chip} aria-live="polite">
        {isComplete
          ? "All questions graded"
          : `Next: Q${nextQNumber}${nextSectionName ? ` · ${nextSectionName}` : ""}`}
      </p>
    </section>
  );
}
