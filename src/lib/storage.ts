import type { AnswerStatus, QuestionTag } from "./scoring";
import type { ExamType } from "./presets";
import { PRESETS } from "./presets";
import { isValidUnit } from "./units";
import type { SavedRecord } from "./records";

export const CURRENT_SCHEMA_VERSION = 1;
const CURRENT_KEY = "omr:current";
const RECORDS_KEY = "omr:records";

export interface CurrentSheet {
  schemaVersion: number;
  examType: ExamType;
  title: string;
  student: string;
  totalQ: number;
  correctMark: number;
  wrongMark: number;
  answers: AnswerStatus[];
  /** Parallel-indexed to `answers`; only populated for Subjective sheets. */
  units: (QuestionTag | null)[];
  targets: { jee: number | null; test: number | null; subjective: number | null };
}

export function defaultSheet(examType: ExamType = "jee"): CurrentSheet {
  const preset = PRESETS[examType];
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    examType,
    title: "",
    student: "",
    totalQ: preset.totalQ,
    correctMark: preset.correctMark,
    wrongMark: preset.wrongMark,
    answers: [],
    units: [],
    targets: { jee: null, test: null, subjective: null },
  };
}

const ANSWER_STATUSES: AnswerStatus[] = ["correct", "incorrect", "unattempted"];
const EXAM_TYPES: ExamType[] = ["jee", "test", "subjective"];

/** A `units` array is valid if every entry is either null or a real Subject+Unit pair. */
function isValidUnitsArray(value: unknown): value is (QuestionTag | null)[] {
  return (
    Array.isArray(value) &&
    value.every((u) => {
      if (u === null) return true;
      if (typeof u !== "object") return false;
      const tag = u as Record<string, unknown>;
      return isValidUnit(tag.subject, tag.unit);
    })
  );
}

function isValidSheet(value: unknown): value is CurrentSheet {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.schemaVersion === "number" &&
    typeof v.examType === "string" &&
    EXAM_TYPES.includes(v.examType as ExamType) &&
    typeof v.title === "string" &&
    typeof v.student === "string" &&
    typeof v.totalQ === "number" &&
    typeof v.correctMark === "number" &&
    typeof v.wrongMark === "number" &&
    Array.isArray(v.answers) &&
    v.answers.every((a) => ANSWER_STATUSES.includes(a as AnswerStatus)) &&
    typeof v.targets === "object" &&
    v.targets !== null
  );
}

/**
 * Migrates an older/partial sheet to the current schema. Unknown shapes (including sheets
 * with a dropped exam type like the retired NEET preset) fall back to a fresh sheet. `units`
 * is optional on load — older saved sheets without it default to an empty array.
 */
function migrate(value: unknown): CurrentSheet {
  if (!isValidSheet(value)) return defaultSheet();
  const units = isValidUnitsArray(value.units) ? value.units : [];
  return { ...value, units };
}

export function loadCurrentSheet(): CurrentSheet {
  if (typeof window === "undefined") return defaultSheet();
  try {
    const raw = window.localStorage.getItem(CURRENT_KEY);
    if (!raw) return defaultSheet();
    return migrate(JSON.parse(raw));
  } catch {
    return defaultSheet();
  }
}

export function saveCurrentSheet(sheet: CurrentSheet): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CURRENT_KEY, JSON.stringify(sheet));
  } catch {
    // Storage can fail (quota, private browsing, etc.) — losing a debounced write is
    // acceptable; the in-memory state is still correct for the current session.
  }
}

function isValidRecord(value: unknown): value is SavedRecord {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.schemaVersion === "number" &&
    typeof v.examType === "string" &&
    EXAM_TYPES.includes(v.examType as ExamType) &&
    typeof v.title === "string" &&
    typeof v.student === "string" &&
    typeof v.savedAt === "string" &&
    typeof v.correctMark === "number" &&
    typeof v.wrongMark === "number" &&
    typeof v.totalQ === "number" &&
    Array.isArray(v.answers) &&
    v.answers.every((a) => ANSWER_STATUSES.includes(a as AnswerStatus)) &&
    (v.units === undefined || isValidUnitsArray(v.units)) &&
    typeof v.score === "number" &&
    typeof v.maxMarks === "number" &&
    typeof v.correct === "number" &&
    typeof v.incorrect === "number" &&
    typeof v.unattempted === "number" &&
    typeof v.graded === "number" &&
    typeof v.attempted === "number" &&
    typeof v.accuracy === "number" &&
    Array.isArray(v.sections)
  );
}

export function loadRecords(): SavedRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Corrupt individual entries are dropped rather than discarding the whole list.
    // `units` is optional on load — older saved records without it default to an empty array.
    return parsed.filter(isValidRecord).map((r) => ({ ...r, units: r.units ?? [] }));
  } catch {
    return [];
  }
}

export function saveRecords(records: SavedRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch {
    // See saveCurrentSheet.
  }
}

export function addRecord(record: SavedRecord): SavedRecord[] {
  const records = [...loadRecords(), record];
  saveRecords(records);
  return records;
}

export function deleteRecord(id: string): SavedRecord[] {
  const records = loadRecords().filter((r) => r.id !== id);
  saveRecords(records);
  return records;
}

export function exportBackupJSON(): string {
  const payload = { exportedAt: new Date().toISOString(), records: loadRecords() };
  return JSON.stringify(payload, null, 2);
}

export interface ImportResult {
  added: number;
  duplicates: number;
  invalid: number;
}

/** Throws if `json` isn't parseable JSON — callers should wrap this in try/catch. */
export function importBackupJSON(json: string): ImportResult {
  const parsed: unknown = JSON.parse(json);
  const incoming: unknown[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as { records?: unknown })?.records)
      ? (parsed as { records: unknown[] }).records
      : [];

  const valid = incoming.filter(isValidRecord).map((r) => ({ ...r, units: r.units ?? [] }));
  const invalid = incoming.length - valid.length;

  const existing = loadRecords();
  const existingIds = new Set(existing.map((r) => r.id));
  const toAdd = valid.filter((r) => !existingIds.has(r.id));
  const duplicates = valid.length - toAdd.length;

  saveRecords([...existing, ...toAdd]);
  return { added: toAdd.length, duplicates, invalid };
}
