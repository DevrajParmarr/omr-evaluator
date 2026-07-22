import { describe, expect, it } from "vitest";
import { computeSectionBreakdown, computeSummary } from "./scoring";
import { PRESETS } from "./presets";

describe("computeSummary", () => {
  it("returns all zeros for an empty answer sheet", () => {
    expect(computeSummary([], 4, 1)).toEqual({
      score: 0,
      maxMarks: 0,
      correct: 0,
      incorrect: 0,
      unattempted: 0,
      graded: 0,
      attempted: 0,
      accuracy: 0,
    });
  });

  it("computes score as correct*correctMark - incorrect*wrongMark", () => {
    const answers = ["correct", "correct", "incorrect", "unattempted"] as const;
    const summary = computeSummary([...answers], 4, 1);
    expect(summary.correct).toBe(2);
    expect(summary.incorrect).toBe(1);
    expect(summary.unattempted).toBe(1);
    expect(summary.graded).toBe(4);
    expect(summary.attempted).toBe(3);
    expect(summary.score).toBe(2 * 4 - 1 * 1);
    expect(summary.maxMarks).toBe(4 * 4);
  });

  it("rounds accuracy to the nearest percent and is 0 when nothing is attempted", () => {
    const allUnattempted = computeSummary(["unattempted", "unattempted"], 4, 1);
    expect(allUnattempted.accuracy).toBe(0);

    // 2 correct out of 3 attempted -> 66.67% -> rounds to 67
    const summary = computeSummary(["correct", "correct", "incorrect"], 4, 1);
    expect(summary.accuracy).toBe(67);
  });

  it("supports custom marking schemes", () => {
    const summary = computeSummary(["correct", "incorrect"], 2, 0.5);
    expect(summary.score).toBe(2 - 0.5);
  });
});

describe("computeSectionBreakdown", () => {
  it("matches the documented JEE example shape for a fully graded sheet", () => {
    const { sections, correctMark, wrongMark } = PRESETS.jee;
    // Physics: 18 correct, 4 incorrect, 3 unattempted (25 total)
    const physics = [
      ...Array(18).fill("correct"),
      ...Array(4).fill("incorrect"),
      ...Array(3).fill("unattempted"),
    ];
    const rest = Array(75 - 25).fill("unattempted");
    const answers = [...physics, ...rest] as const;

    const breakdown = computeSectionBreakdown([...answers], sections, correctMark, wrongMark);
    const physicsBreakdown = breakdown.find((s) => s.name === "Physics");

    expect(physicsBreakdown).toEqual({
      name: "Physics",
      color: "#3b6fe0",
      c: 18,
      w: 4,
      u: 3,
      marks: 18 * 4 - 4 * 1,
      maxM: 100,
      count: 25,
    });
  });

  it("only counts questions that have been graded so far", () => {
    const { sections, correctMark, wrongMark } = PRESETS.jee;
    // Only the first 10 questions (all Physics) have been graded.
    const answers = Array(10).fill("correct");

    const breakdown = computeSectionBreakdown(answers, sections, correctMark, wrongMark);
    const physics = breakdown.find((s) => s.name === "Physics");
    const chemistry = breakdown.find((s) => s.name === "Chemistry");

    expect(physics?.c).toBe(10);
    expect(physics?.count).toBe(25);
    expect(chemistry?.c).toBe(0);
    expect(chemistry?.count).toBe(25);
  });

  it("returns an empty array for Test presets (no sections)", () => {
    const breakdown = computeSectionBreakdown([], PRESETS.test.sections, 4, 1);
    expect(breakdown).toEqual([]);
  });
});
