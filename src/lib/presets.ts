export type ExamType = "neet" | "jee" | "test";

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
  neet: {
    totalQ: 180,
    correctMark: 4,
    wrongMark: 1,
    sections: [
      { name: "Physics", color: "#3b6fe0", startQ: 1, endQ: 45 },
      { name: "Chemistry", color: "#e0871e", startQ: 46, endQ: 90 },
      { name: "Botany", color: "#1c8a4a", startQ: 91, endQ: 135 },
      { name: "Zoology", color: "#b0479b", startQ: 136, endQ: 180 },
    ],
  },
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
};

export const EXAM_LABELS: Record<ExamType, string> = {
  neet: "NEET",
  jee: "JEE",
  test: "Test",
};

/** 1-indexed question number. Returns undefined for Test (no sections) or out-of-range input. */
export function sectionForQuestion(
  sections: Section[],
  questionNumber: number,
): Section | undefined {
  return sections.find((s) => questionNumber >= s.startQ && questionNumber <= s.endQ);
}
