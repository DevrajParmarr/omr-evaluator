import { EXAM_LABELS } from "@/lib/presets";
import type { CurrentSheet } from "@/lib/storage";
import type { ScoreSummary, SectionBreakdown } from "@/lib/scoring";
import styles from "./PrintReport.module.css";

interface Props {
  sheet: CurrentSheet;
  summary: ScoreSummary;
  breakdown: SectionBreakdown[];
}

export default function PrintReport({ sheet, summary, breakdown }: Props) {
  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={`print-only ${styles.report}`}>
      <header className={styles.header}>
        <h1>{sheet.title || "Untitled sheet"}</h1>
        <p>
          {EXAM_LABELS[sheet.examType]}
          {sheet.student && <> · {sheet.student}</>} · {date}
        </p>
      </header>

      <p className={styles.score}>
        Score: {summary.score} / {sheet.totalQ * sheet.correctMark}
      </p>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Correct</th>
            <th>Incorrect</th>
            <th>Unattempted</th>
            <th>Attempted</th>
            <th>Graded</th>
            <th>Accuracy</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{summary.correct}</td>
            <td>{summary.incorrect}</td>
            <td>{summary.unattempted}</td>
            <td>{summary.attempted}</td>
            <td>
              {summary.graded} / {sheet.totalQ}
            </td>
            <td>{summary.accuracy}%</td>
          </tr>
        </tbody>
      </table>

      {breakdown.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Correct</th>
              <th>Incorrect</th>
              <th>Unattempted</th>
              <th>Marks</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((section) => (
              <tr key={section.name}>
                <td>{section.name}</td>
                <td>{section.c}</td>
                <td>{section.w}</td>
                <td>{section.u}</td>
                <td>
                  {section.marks} / {section.maxM}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className={styles.sheetHeading}>Answer Sheet</h2>
      <div className={styles.grid}>
        {sheet.answers.map((status, i) => (
          <span key={i} className={`${styles.bubble} ${styles[status]}`}>
            {i + 1}
          </span>
        ))}
      </div>
    </div>
  );
}
