import type { Section } from "@/lib/presets";
import type { AnswerStatus, QuestionTag } from "@/lib/scoring";
import styles from "./AnswerSheet.module.css";

interface Props {
  totalQ: number;
  sections: Section[];
  answers: AnswerStatus[];
  units: (QuestionTag | null)[];
  onTapBubble: (index: number) => void;
}

function bubbleClassName(status: AnswerStatus | undefined): string {
  if (status === "correct") return styles.correct;
  if (status === "incorrect") return styles.incorrect;
  if (status === "unattempted") return styles.unattempted;
  return styles.ungraded;
}

function Bubble({
  questionNumber,
  answers,
  units,
  onTapBubble,
}: {
  questionNumber: number;
  answers: AnswerStatus[];
  units: (QuestionTag | null)[];
  onTapBubble: (index: number) => void;
}) {
  const index = questionNumber - 1;
  const isGraded = index < answers.length;
  const status = answers[index];
  const tag = units[index];

  return (
    <button
      type="button"
      className={`${styles.bubble} ${bubbleClassName(status)}`}
      disabled={!isGraded}
      aria-label={`Question ${questionNumber}${status ? `, ${status}` : ", not yet graded"}${tag ? `, ${tag.subject}: ${tag.unit}` : ""}`}
      onClick={() => onTapBubble(index)}
    >
      {questionNumber}
    </button>
  );
}

export default function AnswerSheet({ totalQ, sections, answers, units, onTapBubble }: Props) {
  const questionNumbers = Array.from({ length: totalQ }, (_, i) => i + 1);

  if (sections.length === 0) {
    return (
      <section className={styles.sheet} aria-label="Answer sheet">
        <div className={styles.grid}>
          {questionNumbers.map((q) => (
            <Bubble
              key={q}
              questionNumber={q}
              answers={answers}
              units={units}
              onTapBubble={onTapBubble}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.sheet} aria-label="Answer sheet">
      {sections.map((section) => {
        const sectionQuestions = questionNumbers.filter(
          (q) => q >= section.startQ && q <= section.endQ,
        );
        if (sectionQuestions.length === 0) return null;
        return (
          <div key={section.name} className={styles.group}>
            <h3 className={styles.groupHeading}>
              <span className={styles.dot} style={{ backgroundColor: section.color }} aria-hidden />
              {section.name}
            </h3>
            <div className={styles.grid}>
              {sectionQuestions.map((q) => (
                <Bubble
                  key={q}
                  questionNumber={q}
                  answers={answers}
                  units={units}
                  onTapBubble={onTapBubble}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
