import { describe, expect, it } from "vitest";
import { createRecord, sheetFromRecord } from "./records";
import { defaultSheet } from "./storage";
import type { QuestionTag } from "./scoring";

describe("createRecord", () => {
  it("computes score/summary/sections from the sheet's answers", () => {
    const sheet = {
      ...defaultSheet("jee"),
      title: "Mock 1",
      student: "Roll 21",
      answers: [...Array(25).fill("correct"), ...Array(50).fill("unattempted")] as const,
    };

    const record = createRecord(
      { ...sheet, answers: [...sheet.answers] },
      "2026-01-10T09:20:00.000Z",
    );

    expect(record.examType).toBe("jee");
    expect(record.title).toBe("Mock 1");
    expect(record.student).toBe("Roll 21");
    expect(record.savedAt).toBe("2026-01-10T09:20:00.000Z");
    expect(record.correct).toBe(25);
    expect(record.score).toBe(25 * 4);
    expect(record.graded).toBe(75);
    expect(record.sections.find((s) => s.name === "Physics")?.c).toBe(25);
    expect(record.sections.find((s) => s.name === "Chemistry")?.c).toBe(0);
    expect(record.id).toMatch(/^rec_\d+$/);
  });
});

describe("sheetFromRecord", () => {
  it("reconstructs a current sheet from a saved record, preserving passed-in targets", () => {
    const sheet = {
      ...defaultSheet("test"),
      title: "Mock 3",
      answers: ["correct", "incorrect"] as const,
    };
    const record = createRecord({ ...sheet, answers: [...sheet.answers] });
    const targets = { jee: null, test: 90, subjective: null };

    const reopened = sheetFromRecord(record, targets);

    expect(reopened.examType).toBe("test");
    expect(reopened.title).toBe("Mock 3");
    expect(reopened.answers).toEqual(["correct", "incorrect"]);
    expect(reopened.targets).toEqual(targets);
  });

  it("carries the per-question unit tags through for Subjective attempts", () => {
    const sheet = {
      ...defaultSheet("subjective"),
      title: "Practice set",
      answers: ["correct", "incorrect"] as const,
      units: [{ subject: "Physics", unit: "Kinematics" } as QuestionTag, null],
    };
    const record = createRecord({ ...sheet, answers: [...sheet.answers] });

    expect(record.units).toEqual([{ subject: "Physics", unit: "Kinematics" }, null]);

    const reopened = sheetFromRecord(record, { jee: null, test: null, subjective: null });
    expect(reopened.units).toEqual([{ subject: "Physics", unit: "Kinematics" }, null]);
  });
});
