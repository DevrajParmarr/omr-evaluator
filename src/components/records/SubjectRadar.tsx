"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { SubjectPerformancePoint } from "@/lib/analytics";
import styles from "./SubjectRadar.module.css";

interface Props {
  performance: SubjectPerformancePoint[];
  strongest: string | null;
  needsWork: string | null;
  hasPrevious: boolean;
}

export default function SubjectRadar({ performance, strongest, needsWork, hasPrevious }: Props) {
  return (
    <section className={styles.card} aria-label="Subject performance">
      <h2 className={styles.heading}>Subject Performance</h2>
      <div className={styles.chips}>
        {strongest && (
          <span className={`${styles.chip} ${styles.strong}`}>Strongest: {strongest}</span>
        )}
        {needsWork && (
          <span className={`${styles.chip} ${styles.weak}`}>Needs work: {needsWork}</span>
        )}
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={performance}>
            <PolarGrid stroke="var(--color-line)" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip />
            {hasPrevious && (
              <Radar
                name="Previous"
                dataKey="previous"
                stroke="var(--color-unattempted)"
                fill="var(--color-unattempted)"
                fillOpacity={0.15}
              />
            )}
            <Radar
              name="Latest"
              dataKey="latest"
              stroke="var(--color-physics)"
              fill="var(--color-physics)"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Subject percentage, latest vs previous attempt</caption>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Latest %</th>
            <th>Previous %</th>
          </tr>
        </thead>
        <tbody>
          {performance.map((p) => (
            <tr key={p.subject}>
              <td>{p.subject}</td>
              <td>{p.latest}</td>
              <td>{p.previous}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
