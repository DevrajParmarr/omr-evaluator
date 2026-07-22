import { describe, expect, it } from "vitest";
import {
  computeStatCards,
  computeSubjectPerformance,
  computeTargetProgress,
  computeTrendSeries,
  computeUnitPerformance,
  metricSeries,
  strongestAndWeakest,
  subjectSeries,
  weakestUnits,
} from "./analytics";
import { createRecord } from "./records";
import { defaultSheet } from "./storage";
import type { AnswerStatus, QuestionTag } from "./scoring";

function jeeRecord(
  title: string,
  savedAt: string,
  physicsCorrect: number,
  chemistryCorrect: number,
  mathsCorrect: number,
) {
  const answers: AnswerStatus[] = [
    ...Array(physicsCorrect).fill("correct"),
    ...Array(25 - physicsCorrect).fill("unattempted"),
    ...Array(chemistryCorrect).fill("correct"),
    ...Array(25 - chemistryCorrect).fill("unattempted"),
    ...Array(mathsCorrect).fill("correct"),
    ...Array(25 - mathsCorrect).fill("unattempted"),
  ];
  return createRecord({ ...defaultSheet("jee"), title, answers }, savedAt);
}

describe("computeStatCards", () => {
  it("returns nulls for an empty record list", () => {
    expect(computeStatCards([])).toEqual({
      attempts: 0,
      best: null,
      average: null,
      latest: null,
      latestDelta: null,
    });
  });

  it("computes attempts/best/average/latest and the delta vs the previous attempt", () => {
    const r1 = jeeRecord("A", "2026-01-01T00:00:00.000Z", 10, 10, 10); // score 120
    const r2 = jeeRecord("B", "2026-01-02T00:00:00.000Z", 15, 15, 15); // score 180
    const stats = computeStatCards([r1, r2]);

    expect(stats.attempts).toBe(2);
    expect(stats.best).toBe(180);
    expect(stats.average).toBe(150);
    expect(stats.latest).toBe(180);
    expect(stats.latestDelta).toBe(60);
  });

  it("has a null delta with only one attempt", () => {
    const r1 = jeeRecord("A", "2026-01-01T00:00:00.000Z", 10, 10, 10);
    expect(computeStatCards([r1]).latestDelta).toBeNull();
  });
});

describe("computeTargetProgress", () => {
  it("caps progress at 100% and reports remaining/reached", () => {
    expect(computeTargetProgress(500, 650)).toEqual({
      target: 650,
      best: 500,
      progressPercent: Math.round((500 / 650) * 100),
      remaining: 150,
      reached: false,
    });
    expect(computeTargetProgress(700, 650)).toEqual({
      target: 650,
      best: 700,
      progressPercent: 100,
      remaining: 0,
      reached: true,
    });
  });

  it("handles no target set", () => {
    expect(computeTargetProgress(500, null)).toEqual({
      target: null,
      best: 500,
      progressPercent: 0,
      remaining: 0,
      reached: false,
    });
  });
});

describe("computeTrendSeries", () => {
  it("sorts by date ascending and falls back to Attempt N when title is blank", () => {
    const r1 = jeeRecord("", "2026-01-02T00:00:00.000Z", 20, 20, 20);
    const r2 = jeeRecord("Mock 1", "2026-01-01T00:00:00.000Z", 10, 10, 10);
    const series = computeTrendSeries([r1, r2]);

    expect(series.map((p) => p.label)).toEqual(["Mock 1", "Attempt 2"]);
    expect(series[0].score).toBe(r2.score);
    expect(series[1].score).toBe(r1.score);
  });
});

describe("computeSubjectPerformance / strongestAndWeakest", () => {
  it("compares the latest attempt's subject percentages against the previous one", () => {
    const r1 = jeeRecord("A", "2026-01-01T00:00:00.000Z", 5, 20, 10); // Physics weak, Chem strong
    const r2 = jeeRecord("B", "2026-01-02T00:00:00.000Z", 25, 5, 10); // Physics now strong, Chem weak

    const performance = computeSubjectPerformance([r1, r2]);
    const physics = performance.find((p) => p.subject === "Physics")!;
    const chemistry = performance.find((p) => p.subject === "Chemistry")!;

    expect(physics.latest).toBe(100);
    expect(physics.previous).toBe(20);
    expect(chemistry.latest).toBe(20);
    expect(chemistry.previous).toBe(80);

    const { strongest, needsWork } = strongestAndWeakest(performance);
    expect(strongest).toBe("Physics");
    expect(needsWork).toBe("Chemistry");
  });

  it("returns an empty array with no records", () => {
    expect(computeSubjectPerformance([])).toEqual([]);
    expect(strongestAndWeakest([])).toEqual({ strongest: null, needsWork: null });
  });
});

describe("subjectSeries / metricSeries", () => {
  it("produces one point per attempt for a single subject", () => {
    const r1 = jeeRecord("A", "2026-01-01T00:00:00.000Z", 20, 10, 10);
    const series = subjectSeries([r1], "Physics");
    expect(series).toEqual([{ label: "A", c: 20, w: 0, u: 5 }]);
  });

  it("produces one field per subject for a chosen metric", () => {
    const r1 = jeeRecord("A", "2026-01-01T00:00:00.000Z", 20, 10, 5);
    const series = metricSeries([r1], ["Physics", "Chemistry", "Maths"], "c");
    expect(series).toEqual([{ label: "A", Physics: 20, Chemistry: 10, Maths: 5 }]);
  });
});

function subjectiveRecord(answers: AnswerStatus[], units: (QuestionTag | null)[]) {
  return createRecord({ ...defaultSheet("subjective"), answers, units });
}

describe("computeUnitPerformance / weakestUnits", () => {
  it("aggregates correct/incorrect/unattempted per (subject, unit) across records", () => {
    const r1 = subjectiveRecord(
      ["correct", "incorrect", "correct"],
      [
        { subject: "Physics", unit: "Kinematics" },
        { subject: "Physics", unit: "Kinematics" },
        { subject: "Maths", unit: "Trigonometry" },
      ],
    );
    const r2 = subjectiveRecord(["incorrect"], [{ subject: "Physics", unit: "Kinematics" }]);

    const performance = computeUnitPerformance([r1, r2]);
    const kinematics = performance.find((p) => p.unit === "Kinematics")!;
    const trig = performance.find((p) => p.unit === "Trigonometry")!;

    expect(kinematics).toEqual({
      subject: "Physics",
      unit: "Kinematics",
      attempted: 3,
      correct: 1,
      incorrect: 2,
      unattempted: 0,
      accuracy: 33,
    });
    expect(trig.accuracy).toBe(100);
  });

  it("ignores untagged questions and units nobody has attempted", () => {
    const r1 = subjectiveRecord(["correct"], [null]);
    expect(computeUnitPerformance([r1])).toEqual([]);
  });

  it("returns the lowest-accuracy attempted units first, capped to n", () => {
    const r1 = subjectiveRecord(
      ["correct", "incorrect", "incorrect"],
      [
        { subject: "Physics", unit: "Kinematics" },
        { subject: "Maths", unit: "Trigonometry" },
        { subject: "Chemistry", unit: "Equilibrium" },
      ],
    );
    const performance = computeUnitPerformance([r1]);
    const weakest = weakestUnits(performance, 2);

    expect(weakest).toHaveLength(2);
    expect(weakest.every((u) => u.accuracy === 0)).toBe(true);
  });
});
