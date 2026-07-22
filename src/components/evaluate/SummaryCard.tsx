import type { ScoreSummary } from "@/lib/scoring";
import styles from "./SummaryCard.module.css";

interface Props {
  summary: ScoreSummary;
  totalQ: number;
}

export default function SummaryCard({ summary, totalQ }: Props) {
  const stats: Array<{ label: string; value: number }> = [
    { label: "Correct", value: summary.correct },
    { label: "Incorrect", value: summary.incorrect },
    { label: "Unattempted", value: summary.unattempted },
    { label: "Attempted", value: summary.attempted },
    { label: "Graded", value: summary.graded },
    { label: "Total Qs", value: totalQ },
  ];

  return (
    <section className={styles.card} aria-label="Summary">
      <h2 className={styles.heading}>Summary</h2>
      <dl className={styles.grid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <dt>{stat.label}</dt>
            <dd data-numeric>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
