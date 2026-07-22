import type { SavedRecord } from "./records";

function byDateAscending(records: SavedRecord[]): SavedRecord[] {
  return [...records].sort((a, b) => a.savedAt.localeCompare(b.savedAt));
}

function labelFor(record: SavedRecord, index: number): string {
  return record.title.trim() || `Attempt ${index + 1}`;
}

export interface StatCards {
  attempts: number;
  best: number | null;
  average: number | null;
  latest: number | null;
  /** latest score minus the previous attempt's score; null if fewer than 2 attempts. */
  latestDelta: number | null;
}

export function computeStatCards(records: SavedRecord[]): StatCards {
  if (records.length === 0) {
    return { attempts: 0, best: null, average: null, latest: null, latestDelta: null };
  }
  const sorted = byDateAscending(records);
  const scores = sorted.map((r) => r.score);
  const latest = scores[scores.length - 1];
  const previous = scores.length > 1 ? scores[scores.length - 2] : null;

  return {
    attempts: records.length,
    best: Math.max(...scores),
    average: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length),
    latest,
    latestDelta: previous === null ? null : latest - previous,
  };
}

export interface TargetProgress {
  target: number | null;
  best: number;
  progressPercent: number;
  remaining: number;
  reached: boolean;
}

export function computeTargetProgress(best: number, target: number | null): TargetProgress {
  if (target === null || target <= 0) {
    return { target, best, progressPercent: 0, remaining: 0, reached: false };
  }
  return {
    target,
    best,
    progressPercent: Math.min(100, Math.round((best / target) * 100)),
    remaining: Math.max(0, target - best),
    reached: best >= target,
  };
}

export interface TrendPoint {
  label: string;
  score: number;
}

export function computeTrendSeries(records: SavedRecord[]): TrendPoint[] {
  return byDateAscending(records).map((r, i) => ({ label: labelFor(r, i), score: r.score }));
}

export interface SubjectPerformancePoint {
  subject: string;
  color: string;
  latest: number;
  previous: number;
}

/** Percentage-of-max marks per subject, for the latest attempt vs the one before it. */
export function computeSubjectPerformance(records: SavedRecord[]): SubjectPerformancePoint[] {
  const sorted = byDateAscending(records);
  if (sorted.length === 0) return [];

  const latestRecord = sorted[sorted.length - 1];
  const previousRecord = sorted.length > 1 ? sorted[sorted.length - 2] : undefined;

  return latestRecord.sections.map((section) => {
    const previousSection = previousRecord?.sections.find((s) => s.name === section.name);
    const latestPct = section.maxM > 0 ? Math.round((section.marks / section.maxM) * 100) : 0;
    const previousPct =
      previousSection && previousSection.maxM > 0
        ? Math.round((previousSection.marks / previousSection.maxM) * 100)
        : 0;
    return {
      subject: section.name,
      color: section.color,
      latest: latestPct,
      previous: previousPct,
    };
  });
}

export function strongestAndWeakest(performance: SubjectPerformancePoint[]): {
  strongest: string | null;
  needsWork: string | null;
} {
  if (performance.length === 0) return { strongest: null, needsWork: null };
  const sorted = [...performance].sort((a, b) => b.latest - a.latest);
  return { strongest: sorted[0].subject, needsWork: sorted[sorted.length - 1].subject };
}

export type ProgressMetric = "c" | "w" | "u" | "attempted";

export interface SubjectAttemptPoint {
  label: string;
  c: number;
  w: number;
  u: number;
}

/** Correct/incorrect/unattempted for one subject, across attempts in date order. */
export function subjectSeries(records: SavedRecord[], subjectName: string): SubjectAttemptPoint[] {
  return byDateAscending(records).map((r, i) => {
    const section = r.sections.find((s) => s.name === subjectName);
    return { label: labelFor(r, i), c: section?.c ?? 0, w: section?.w ?? 0, u: section?.u ?? 0 };
  });
}

export type MetricSeriesPoint = { label: string } & Record<string, number | string>;

/** One chosen metric, one line per subject, across attempts in date order. */
export function metricSeries(
  records: SavedRecord[],
  subjectNames: string[],
  metric: ProgressMetric,
): MetricSeriesPoint[] {
  return byDateAscending(records).map((r, i) => {
    const point: MetricSeriesPoint = { label: labelFor(r, i) };
    for (const name of subjectNames) {
      const section = r.sections.find((s) => s.name === name);
      const c = section?.c ?? 0;
      const w = section?.w ?? 0;
      const u = section?.u ?? 0;
      point[name] = metric === "c" ? c : metric === "w" ? w : metric === "u" ? u : c + w;
    }
    return point;
  });
}
