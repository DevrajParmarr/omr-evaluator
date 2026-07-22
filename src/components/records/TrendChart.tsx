"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/lib/analytics";
import styles from "./TrendChart.module.css";

interface Props {
  data: TrendPoint[];
  target: number | null;
}

export default function TrendChart({ data, target }: Props) {
  return (
    <section className={styles.card} aria-label="Score trend">
      <h2 className={styles.heading}>Score Trend</h2>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="var(--color-line)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            {target !== null && (
              <ReferenceLine
                y={target}
                stroke="var(--color-incorrect)"
                strokeDasharray="4 4"
                label={{ value: "Target", position: "insideTopRight", fontSize: 12 }}
              />
            )}
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--color-physics)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Score by attempt</caption>
        <thead>
          <tr>
            <th>Attempt</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.label}>
              <td>{point.label}</td>
              <td>{point.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
