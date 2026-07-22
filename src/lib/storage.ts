import type { AnswerStatus } from "./scoring";
import type { ExamType } from "./presets";
import { PRESETS } from "./presets";

export const CURRENT_SCHEMA_VERSION = 1;
const CURRENT_KEY = "omr:current";

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
