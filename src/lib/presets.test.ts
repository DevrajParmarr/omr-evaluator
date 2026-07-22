import { describe, expect, it } from "vitest";
import { PRESETS, sectionForQuestion } from "./presets";

describe("presets", () => {
  it("NEET sections cover exactly 1-180 with no gaps or overlaps", () => {
    const { sections, totalQ } = PRESETS.neet;
    for (let q = 1; q <= totalQ; q++) {
      const matches = sections.filter((s) => q >= s.startQ && q <= s.endQ);
      expect(matches).toHaveLength(1);
    }
  });

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
});

describe("sectionForQuestion", () => {
  it("finds the right section at range boundaries", () => {
    const { sections } = PRESETS.neet;
    expect(sectionForQuestion(sections, 1)?.name).toBe("Physics");
    expect(sectionForQuestion(sections, 45)?.name).toBe("Physics");
    expect(sectionForQuestion(sections, 46)?.name).toBe("Chemistry");
    expect(sectionForQuestion(sections, 180)?.name).toBe("Zoology");
  });

  it("returns undefined outside the range", () => {
    const { sections } = PRESETS.neet;
    expect(sectionForQuestion(sections, 0)).toBeUndefined();
    expect(sectionForQuestion(sections, 181)).toBeUndefined();
  });

  it("returns undefined for empty sections (Test preset)", () => {
    expect(sectionForQuestion(PRESETS.test.sections, 1)).toBeUndefined();
  });
});
