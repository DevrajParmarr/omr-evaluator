export type ExamType = "jee" | "test" | "subjective";

export interface Section {
  name: string;
  color: string;
  /** 1-indexed, inclusive */
  startQ: number;
  /** 1-indexed, inclusive */
  endQ: number;
}

export interface Preset {
  totalQ: number;
  correctMark: number;
  wrongMark: number;
  /** Empty for Test (no subject sections). */
  sections: Section[];
}

export const PRESETS: Record<ExamType, Preset> = {
  jee: {
    totalQ: 75,
    correctMark: 4,
    wrongMark: 1,
    sections: [
      { name: "Physics", color: "#3b6fe0", startQ: 1, endQ: 25 },
      { name: "Chemistry", color: "#e0871e", startQ: 26, endQ: 50 },
      { name: "Maths", color: "#b0479b", startQ: 51, endQ: 75 },
    ],
  },
  test: {
    totalQ: 90,
    correctMark: 4,
    wrongMark: 1,
    sections: [],
  },
  subjective: {
    totalQ: 25,
    correctMark: 4,
    wrongMark: 1,
    // No fixed ranges: topic comes from a per-question Subject+Unit tag instead (see units.ts).
    sections: [],
  },
};

export const EXAM_LABELS: Record<ExamType, string> = {
  jee: "JEE",
  test: "Test",
  subjective: "Subjective",
};

/** 1-indexed question number. Returns undefined for Test (no sections) or out-of-range input. */
export function sectionForQuestion(
  sections: Section[],
  questionNumber: number,
): Section | undefined {
  return sections.find((s) => questionNumber >= s.startQ && questionNumber <= s.endQ);
}
