"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SavedRecord } from "@/lib/records";
import { computeUnitPerformance, type UnitPerformance } from "@/lib/analytics";
import { SUBJECTS, SUBJECT_COLORS, type Subject } from "@/lib/units";
import EmptyState from "@/components/EmptyState";
import styles from "./UnitBreakdown.module.css";

interface Props {
  records: SavedRecord[];
}

const FILTER_LABELS: Record<"all" | Subject, string> = {
  all: "All",
  Physics: "Physics",
  Chemistry: "Chemistry",
  Maths: "Maths",
};

export default function UnitBreakdown({ records }: Props) {
  const [filter, setFilter] = useState<"all" | Subject>("all");
  const performance = useMemo(() => computeUnitPerformance(records), [records]);

  const attempted = useMemo(() => performance.filter((p) => p.attempted > 0), [performance]);

  const filtered = useMemo(
    () =>
      (filter === "all" ? attempted : attempted.filter((p) => p.subject === filter))
        .slice()
        .sort((a, b) => a.accuracy - b.accuracy),
    [attempted, filter],
  );

  if (attempted.length === 0) {
    return (
      <section className={styles.card} aria-label="Unit breakdown">
        <h2 className={styles.heading}>Unit Breakdown</h2>
        <EmptyState
          title="No tagged questions yet"
          description="Tag questions with a Subject and Unit while grading a Subjective test to see weak topics here."
        />
      </section>
    );
  }

  const height = Math.max(160, filtered.length * 32);

  return (
    <section className={styles.card} aria-label="Unit breakdown">
      <div className={styles.controlsRow}>
        <h2 className={styles.heading}>Unit Breakdown</h2>
        <div className={styles.modeSwitch} role="group" aria-label="Filter by subject">
          {(["all", ...SUBJECTS] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`${styles.modeButton} ${filter === s ? styles.modeActive : ""}`}
              onClick={() => setFilter(s)}
            >
              {FILTER_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <p className={styles.hint}>Weakest units first, by accuracy across all attempts.</p>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={filtered}
          layout="vertical"
          margin={{ top: 8, right: 24, bottom: 0, left: 8 }}
        >
          <CartesianGrid stroke="var(--color-line)" strokeDasharray="4 4" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
          <YAxis type="category" dataKey="unit" width={180} tick={{ fontSize: 11 }} interval={0} />
          <Tooltip
            formatter={(value, _name, item) => {
              const entry = item.payload as UnitPerformance;
              return [`${value}% (${entry.correct}/${entry.attempted})`, entry.subject];
            }}
          />
          <Bar dataKey="accuracy" name="Accuracy" radius={[0, 4, 4, 0]}>
            {filtered.map((entry) => (
              <Cell key={`${entry.subject}-${entry.unit}`} fill={SUBJECT_COLORS[entry.subject]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <table className="sr-only">
        <caption>Accuracy by unit, weakest first</caption>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Unit</th>
            <th>Accuracy</th>
            <th>Correct</th>
            <th>Attempted</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((entry) => (
            <tr key={`${entry.subject}-${entry.unit}`}>
              <td>{entry.subject}</td>
              <td>{entry.unit}</td>
              <td>{entry.accuracy}%</td>
              <td>{entry.correct}</td>
              <td>{entry.attempted}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
