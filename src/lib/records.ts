import type { ExamType } from "./presets";
import { PRESETS } from "./presets";
import {
  computeSectionBreakdown,
  computeSummary,
  type AnswerStatus,
  type QuestionTag,
  type SectionBreakdown,
} from "./scoring";
import type { CurrentSheet } from "./storage";
import { CURRENT_SCHEMA_VERSION } from "./storage";

export interface SavedRecord {
  id: string;
  schemaVersion: number;
  examType: ExamType;
  title: string;
  student: string;
  savedAt: string;
  correctMark: number;
  wrongMark: number;
  totalQ: number;
  answers: AnswerStatus[];
  /** Parallel-indexed to `answers`; only populated for Subjective attempts. */
  units: (QuestionTag | null)[];
  score: number;
  maxMarks: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  graded: number;
  attempted: number;
  accuracy: number;
  sections: SectionBreakdown[];
}

export function createRecord(
  sheet: CurrentSheet,
  savedAt: string = new Date().toISOString(),
): SavedRecord {
  const preset = PRESETS[sheet.examType];
  const summary = computeSummary(sheet.answers, sheet.correctMark, sheet.wrongMark);
  const sections = computeSectionBreakdown(
    sheet.answers,
    preset.sections,
    sheet.correctMark,
    sheet.wrongMark,
  );

  return {
    id: `rec_${Date.now()}`,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    examType: sheet.examType,
    title: sheet.title,
    student: sheet.student,
    savedAt,
    correctMark: sheet.correctMark,
    wrongMark: sheet.wrongMark,
    totalQ: sheet.totalQ,
    answers: sheet.answers,
    units: sheet.units,
    ...summary,
    sections,
  };
}

/** Reconstructs an in-progress sheet from a saved record, for reopening in Evaluate. */
export function sheetFromRecord(
  record: SavedRecord,
  targets: CurrentSheet["targets"],
): CurrentSheet {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    examType: record.examType,
    title: record.title,
    student: record.student,
    totalQ: record.totalQ,
    correctMark: record.correctMark,
    wrongMark: record.wrongMark,
    answers: record.answers,
    units: record.units,
    targets,
  };
}
