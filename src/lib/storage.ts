import type { AnswerStatus } from "./scoring";
import type { ExamType } from "./presets";
import { PRESETS } from "./presets";
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
  targets: { neet: number | null; jee: number | null; test: number | null };
}

export function defaultSheet(examType: ExamType = "neet"): CurrentSheet {
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
    targets: { neet: null, jee: null, test: null },
  };
}

const ANSWER_STATUSES: AnswerStatus[] = ["correct", "incorrect", "unattempted"];
const EXAM_TYPES: ExamType[] = ["neet", "jee", "test"];

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

/** Migrates an older/partial sheet to the current schema. Unknown shapes fall back to a fresh sheet. */
function migrate(value: unknown): CurrentSheet {
  if (isValidSheet(value)) return value;
  return defaultSheet();
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
    return parsed.filter(isValidRecord);
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

  const valid = incoming.filter(isValidRecord);
  const invalid = incoming.length - valid.length;

  const existing = loadRecords();
  const existingIds = new Set(existing.map((r) => r.id));
  const toAdd = valid.filter((r) => !existingIds.has(r.id));
  const duplicates = valid.length - toAdd.length;

  saveRecords([...existing, ...toAdd]);
  return { added: toAdd.length, duplicates, invalid };
}
