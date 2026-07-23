"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SavedRecord } from "@/lib/records";
import { metricSeries, subjectSeries, type ProgressMetric } from "@/lib/analytics";
import type { Section } from "@/lib/presets";
import EmptyState from "@/components/EmptyState";
import styles from "./SubjectProgress.module.css";

type Mode = "bySubject" | "byMetric" | "overview" | "stacked";

const MODE_LABELS: Record<Mode, string> = {
  bySubject: "By subject",
  byMetric: "By metric",
  overview: "Overview",
  stacked: "Stacked",
};

const METRIC_LABELS: Record<ProgressMetric, string> = {
  c: "Correct",
  w: "Incorrect",
  u: "Unattempted",
  attempted: "Attempted",
};

interface Props {
  records: SavedRecord[];
  sections: Section[];
}

export default function SubjectProgress({ records, sections }: Props) {
  const subjectNames = useMemo(() => sections.map((s) => s.name), [sections]);
  const [mode, setMode] = useState<Mode>("bySubject");
  const [selectedSubject, setSelectedSubject] = useState(subjectNames[0] ?? "");
  const [selectedMetric, setSelectedMetric] = useState<ProgressMetric>("c");

  if (records.length < 2) {
    return (
      <section className={styles.card} aria-label="Subject progress">
        <h2 className={styles.heading}>Subject Progress</h2>
        <EmptyState
          title="Not enough attempts yet"
          description="Save at least two attempts to see progress over time."
        />
      </section>
    );
  }

  return (
    <section className={styles.card} aria-label="Subject progress">
      <div className={styles.controlsRow}>
        <h2 className={styles.heading}>Subject Progress</h2>
        <div className={styles.modeSwitch} role="group" aria-label="View mode">
          {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`${styles.modeButton} ${mode === m ? styles.modeActive : ""}`}
              onClick={() => setMode(m)}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>
      </div>

      {(mode === "bySubject" || mode === "stacked") && (
        <label className={styles.selectField}>
          <span>Subject</span>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
            {subjectNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      )}

      {mode === "byMetric" && (
        <label className={styles.selectField}>
          <span>Metric</span>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as ProgressMetric)}
          >
            {(Object.keys(METRIC_LABELS) as ProgressMetric[]).map((m) => (
              <option key={m} value={m}>
                {METRIC_LABELS[m]}
              </option>
            ))}
          </select>
        </label>
      )}

      {mode === "bySubject" && (
        <>
          <LineByStatus data={subjectSeries(records, selectedSubject)} height={260} />
          <AttemptTable data={subjectSeries(records, selectedSubject)} subject={selectedSubject} />
        </>
      )}

      {mode === "stacked" && (
        <>
          <StackedBar data={subjectSeries(records, selectedSubject)} height={260} />
          <AttemptTable data={subjectSeries(records, selectedSubject)} subject={selectedSubject} />
        </>
      )}

      {mode === "byMetric" && (
        <>
          <MetricLines
            data={metricSeries(records, subjectNames, selectedMetric)}
            sections={sections}
            height={260}
          />
          <MetricTable
            data={metricSeries(records, subjectNames, selectedMetric)}
            subjectNames={subjectNames}
            metricLabel={METRIC_LABELS[selectedMetric]}
          />
        </>
      )}

      {mode === "overview" && (
        <>
          <div className={styles.overviewGrid}>
            {subjectNames.map((name) => (
              <div key={name} className={styles.overviewItem}>
                <p className={styles.overviewLabel}>{name}</p>
                <LineByStatus data={subjectSeries(records, name)} height={120} compact />
              </div>
            ))}
          </div>
          <table className="sr-only">
            <caption>Correct/incorrect/unattempted by subject and attempt</caption>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Attempt</th>
                <th>Correct</th>
                <th>Incorrect</th>
                <th>Unattempted</th>
              </tr>
            </thead>
            <tbody>
              {subjectNames.flatMap((name) =>
                subjectSeries(records, name).map((point) => (
                  <tr key={`${name}-${point.label}`}>
                    <td>{name}</td>
                    <td>{point.label}</td>
                    <td>{point.c}</td>
                    <td>{point.w}</td>
                    <td>{point.u}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}

function AttemptTable({
  data,
  subject,
}: {
  data: ReturnType<typeof subjectSeries>;
  subject: string;
}) {
  return (
    <table className="sr-only">
      <caption>{subject}: correct/incorrect/unattempted by attempt</caption>
      <thead>
        <tr>
          <th>Attempt</th>
          <th>Correct</th>
          <th>Incorrect</th>
          <th>Unattempted</th>
        </tr>
      </thead>
      <tbody>
        {data.map((point) => (
          <tr key={point.label}>
            <td>{point.label}</td>
            <td>{point.c}</td>
            <td>{point.w}</td>
            <td>{point.u}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MetricTable({
  data,
  subjectNames,
  metricLabel,
}: {
  data: ReturnType<typeof metricSeries>;
  subjectNames: string[];
  metricLabel: string;
}) {
  return (
    <table className="sr-only">
      <caption>{metricLabel} by subject and attempt</caption>
      <thead>
        <tr>
          <th>Attempt</th>
          {subjectNames.map((name) => (
            <th key={name}>{name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((point) => (
          <tr key={String(point.label)}>
            <td>{point.label}</td>
            {subjectNames.map((name) => (
              <td key={name}>{point[name]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LineByStatus({
  data,
  height,
  compact = false,
}: {
  data: ReturnType<typeof subjectSeries>;
  height: number;
  compact?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: compact ? -24 : -16 }}>
        <CartesianGrid stroke="var(--color-line)" strokeDasharray="4 4" vertical={false} />
        {!compact && <XAxis dataKey="label" tick={{ fontSize: 11 }} />}
        {!compact && <YAxis tick={{ fontSize: 11 }} />}
        {!compact && <Tooltip />}
        {!compact && <Legend wrapperStyle={{ fontSize: 12 }} />}
        <Line
          type="monotone"
          dataKey="c"
          name="Correct"
          stroke="var(--color-correct)"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="w"
          name="Incorrect"
          stroke="var(--color-incorrect)"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="u"
          name="Unattempted"
          stroke="var(--color-unattempted)"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function StackedBar({ data, height }: { data: ReturnType<typeof subjectSeries>; height: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid stroke="var(--color-line)" strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="c" name="Correct" stackId="a" fill="var(--color-correct)" />
        <Bar dataKey="w" name="Incorrect" stackId="a" fill="var(--color-incorrect)" />
        <Bar dataKey="u" name="Unattempted" stackId="a" fill="var(--color-unattempted)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function MetricLines({
  data,
  sections,
  height,
}: {
  data: ReturnType<typeof metricSeries>;
  sections: Section[];
  height: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid stroke="var(--color-line)" strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {sections.map((section) => (
          <Line
            key={section.name}
            type="monotone"
            dataKey={section.name}
            stroke={section.color}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
