import type { Section } from "./presets";
import type { Subject } from "./units";

export type AnswerStatus = "correct" | "incorrect" | "unattempted";

/** Per-question Subject+Unit tag, used by Subjective tests for topic-wise analysis. */
export interface QuestionTag {
  subject: Subject;
  unit: string;
}

export interface ScoreSummary {
  score: number;
  maxMarks: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  /** Number of questions graded so far (answers.length). */
  graded: number;
  attempted: number;
  /** 0-100, rounded. 0 when nothing has been attempted. */
  accuracy: number;
}

export function computeSummary(
  answers: AnswerStatus[],
  correctMark: number,
  wrongMark: number,
): ScoreSummary {
  let correct = 0;
  let incorrect = 0;
  let unattempted = 0;

  for (const answer of answers) {
    if (answer === "correct") correct++;
    else if (answer === "incorrect") incorrect++;
    else unattempted++;
  }

  const attempted = correct + incorrect;
  const graded = answers.length;
  const score = correct * correctMark - incorrect * wrongMark;
  const maxMarks = graded * correctMark;
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  return { score, maxMarks, correct, incorrect, unattempted, graded, attempted, accuracy };
}

export interface SectionBreakdown {
  name: string;
  color: string;
  c: number;
  w: number;
  u: number;
  marks: number;
  maxM: number;
  /** Total questions in this section (regardless of how many are graded so far). */
  count: number;
}

/**
 * `answers` may be shorter than the sections cover (grading in progress); ungraded
 * questions within a section simply don't contribute to its counts yet.
 */
export function computeSectionBreakdown(
  answers: AnswerStatus[],
  sections: Section[],
  correctMark: number,
  wrongMark: number,
): SectionBreakdown[] {
  return sections.map((section) => {
    const slice = answers.slice(section.startQ - 1, section.endQ);
    const summary = computeSummary(slice, correctMark, wrongMark);
    return {
      name: section.name,
      color: section.color,
      c: summary.correct,
      w: summary.incorrect,
      u: summary.unattempted,
      marks: summary.score,
      maxM: (section.endQ - section.startQ + 1) * correctMark,
      count: section.endQ - section.startQ + 1,
    };
  });
}
