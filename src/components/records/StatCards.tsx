import type { StatCards as StatCardsData } from "@/lib/analytics";
import styles from "./StatCards.module.css";

interface Props {
  stats: StatCardsData;
}

export default function StatCards({ stats }: Props) {
  const cards: Array<{ label: string; value: string; delta?: string }> = [
    { label: "Attempts", value: String(stats.attempts) },
    { label: "Best", value: stats.best === null ? "—" : String(stats.best) },
    { label: "Average", value: stats.average === null ? "—" : String(stats.average) },
    {
      label: "Latest",
      value: stats.latest === null ? "—" : String(stats.latest),
      delta:
        stats.latestDelta === null
          ? undefined
          : stats.latestDelta === 0
            ? "no change"
            : stats.latestDelta > 0
              ? `▲ ${stats.latestDelta}`
              : `▼ ${Math.abs(stats.latestDelta)}`,
    },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <div key={card.label} className={styles.card}>
          <p className={styles.label}>{card.label}</p>
          <p className={styles.value} data-numeric>
            {card.value}
          </p>
          {card.delta && (
            <p
              className={`${styles.delta} ${
                stats.latestDelta && stats.latestDelta < 0 ? styles.down : styles.up
              }`}
            >
              {card.delta}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
