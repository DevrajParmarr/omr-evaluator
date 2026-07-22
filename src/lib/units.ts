export type Subject = "Physics" | "Chemistry" | "Maths";

/** Matches the subject colors already used for JEE sections in presets.ts. */
export const SUBJECT_COLORS: Record<Subject, string> = {
  Physics: "#3b6fe0",
  Chemistry: "#e0871e",
  Maths: "#b0479b",
};

export interface UnitGroup {
  /** Optional category label (used to split Chemistry into Physical/Inorganic/Organic). */
  group?: string;
  units: string[];
}

/** JEE (Main) syllabus, unit-wise, used to tag Subjective-test questions by topic. */
export const SUBJECT_UNIT_GROUPS: Record<Subject, UnitGroup[]> = {
  Maths: [
    {
      units: [
        "Sets, Relations and Functions",
        "Complex Numbers and Quadratic Equations",
        "Matrices and Determinants",
        "Permutations and Combinations",
        "Binomial Theorem and Its Simple Applications",
        "Sequence and Series",
        "Limit, Continuity and Differentiability",
        "Integral Calculus",
        "Differential Equations",
        "Coordinate Geometry",
        "Three Dimensional Geometry",
        "Vector Algebra",
        "Statistics and Probability",
        "Trigonometry",
      ],
    },
  ],
  Physics: [
    {
      units: [
        "Units and Measurements",
        "Kinematics",
        "Laws of Motion",
        "Work, Energy and Power",
        "Rotational Motion",
        "Gravitation",
        "Properties of Solids and Liquids",
        "Thermodynamics",
        "Kinetic Theory of Gases",
        "Oscillations and Waves",
        "Electrostatics",
        "Current Electricity",
        "Magnetic Effects of Current and Magnetism",
        "Electromagnetic Induction and Alternating Currents",
        "Electromagnetic Waves",
        "Optics",
        "Dual Nature of Matter and Radiation",
        "Atoms and Nuclei",
        "Electronic Devices",
        "Experimental Skills",
      ],
    },
  ],
  Chemistry: [
    {
      group: "Physical Chemistry",
      units: [
        "Some Basic Concepts in Chemistry",
        "Atomic Structure",
        "Chemical Bonding and Molecular Structure",
        "Chemical Thermodynamics",
        "Solutions",
        "Equilibrium",
        "Redox Reactions and Electrochemistry",
        "Chemical Kinetics",
      ],
    },
    {
      group: "Inorganic Chemistry",
      units: [
        "Classification of Elements and Periodicity in Properties",
        "p-Block Elements (Groups 13 to 18)",
        "d- and f-Block Elements",
        "Coordination Compounds",
      ],
    },
    {
      group: "Organic Chemistry",
      units: [
        "Purification and Characterisation of Organic Compounds",
        "Some Basic Principles of Organic Chemistry",
        "Hydrocarbons",
        "Organic Compounds Containing Halogens",
        "Organic Compounds Containing Oxygen",
        "Organic Compounds Containing Nitrogen",
        "Biomolecules",
        "Principles Related to Practical Chemistry",
      ],
    },
  ],
};

export const SUBJECTS: Subject[] = ["Physics", "Chemistry", "Maths"];

/** Every (subject, unit) pair, flattened — for validation and lookups. */
export const ALL_UNITS: { subject: Subject; unit: string }[] = SUBJECTS.flatMap((subject) =>
  SUBJECT_UNIT_GROUPS[subject].flatMap((g) => g.units.map((unit) => ({ subject, unit }))),
);

export function isValidUnit(subject: unknown, unit: unknown): boolean {
  if (typeof subject !== "string" || typeof unit !== "string") return false;
  return ALL_UNITS.some((u) => u.subject === subject && u.unit === unit);
}
