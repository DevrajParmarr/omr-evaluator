import type { AnswerStatus } from "@/lib/scoring";
import styles from "./MarkButtons.module.css";

interface Props {
  correctMark: number;
  wrongMark: number;
  disabled: boolean;
  onMark: (status: AnswerStatus) => void;
}

export default function MarkButtons({ correctMark, wrongMark, disabled, onMark }: Props) {
  return (
    <div className={styles.buttons} role="group" aria-label="Mark question">
      <button
        type="button"
        className={`${styles.button} ${styles.correct}`}
        disabled={disabled}
        onClick={() => onMark("correct")}
      >
        Correct <span data-numeric>(+{correctMark})</span>
      </button>
      <button
        type="button"
        className={`${styles.button} ${styles.incorrect}`}
        disabled={disabled}
        onClick={() => onMark("incorrect")}
      >
        Incorrect <span data-numeric>(−{wrongMark})</span>
      </button>
      <button
        type="button"
        className={`${styles.button} ${styles.unattempted}`}
        disabled={disabled}
        onClick={() => onMark("unattempted")}
      >
        Unattempted <span data-numeric>(0)</span>
      </button>
    </div>
  );
}
