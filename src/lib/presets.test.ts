import { describe, expect, it } from "vitest";
import { PRESETS, sectionForQuestion } from "./presets";

describe("presets", () => {
  it("JEE sections cover exactly 1-75 with no gaps or overlaps", () => {
    const { sections, totalQ } = PRESETS.jee;
    for (let q = 1; q <= totalQ; q++) {
      const matches = sections.filter((s) => q >= s.startQ && q <= s.endQ);
      expect(matches).toHaveLength(1);
    }
  });

  it("Test preset has no sections", () => {
    expect(PRESETS.test.sections).toEqual([]);
  });

  it("Subjective preset has no fixed sections (topic comes from per-question tags)", () => {
    expect(PRESETS.subjective.sections).toEqual([]);
  });
});

describe("sectionForQuestion", () => {
  it("finds the right section at range boundaries", () => {
    const { sections } = PRESETS.jee;
    expect(sectionForQuestion(sections, 1)?.name).toBe("Physics");
    expect(sectionForQuestion(sections, 25)?.name).toBe("Physics");
    expect(sectionForQuestion(sections, 26)?.name).toBe("Chemistry");
    expect(sectionForQuestion(sections, 75)?.name).toBe("Maths");
  });

  it("returns undefined outside the range", () => {
    const { sections } = PRESETS.jee;
    expect(sectionForQuestion(sections, 0)).toBeUndefined();
    expect(sectionForQuestion(sections, 76)).toBeUndefined();
  });

  it("returns undefined for empty sections (Test preset)", () => {
    expect(sectionForQuestion(PRESETS.test.sections, 1)).toBeUndefined();
  });
});
