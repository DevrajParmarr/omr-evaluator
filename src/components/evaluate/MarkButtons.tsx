import type { MouseEvent } from "react";
import type { AnswerStatus } from "@/lib/scoring";
import { cssVar, flashAnimation, popAnimation, vibrate } from "@/lib/motion";
import styles from "./MarkButtons.module.css";

interface Props {
  correctMark: number;
  wrongMark: number;
  disabled: boolean;
  onMark: (status: AnswerStatus) => void;
}

const FLASH_COLOR_VAR: Record<AnswerStatus, string> = {
  correct: "--color-correct",
  incorrect: "--color-incorrect",
  unattempted: "--color-unattempted",
};

export default function MarkButtons({ correctMark, wrongMark, disabled, onMark }: Props) {
  function handleClick(event: MouseEvent<HTMLButtonElement>, status: AnswerStatus) {
    popAnimation(event.currentTarget);
    flashAnimation(event.currentTarget, cssVar(FLASH_COLOR_VAR[status]));
    vibrate(10);
    onMark(status);
  }

  return (
    <div className={styles.buttons} role="group" aria-label="Mark question">
      <button
        type="button"
        className={`${styles.button} ${styles.correct}`}
        disabled={disabled}
        onClick={(e) => handleClick(e, "correct")}
      >
        Correct <span data-numeric>(+{correctMark})</span>
      </button>
      <button
        type="button"
        className={`${styles.button} ${styles.incorrect}`}
        disabled={disabled}
        onClick={(e) => handleClick(e, "incorrect")}
      >
        Incorrect <span data-numeric>(−{wrongMark})</span>
      </button>
      <button
        type="button"
        className={`${styles.button} ${styles.unattempted}`}
        disabled={disabled}
        onClick={(e) => handleClick(e, "unattempted")}
      >
        Unattempted <span data-numeric>(0)</span>
      </button>
    </div>
  );
}
