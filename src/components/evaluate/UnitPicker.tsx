import { useMemo } from "react";
import { SUBJECTS, SUBJECT_UNIT_GROUPS, type Subject } from "@/lib/units";
import type { QuestionTag } from "@/lib/scoring";
import styles from "./UnitPicker.module.css";

interface Props {
  value: QuestionTag | null;
  onChange: (tag: QuestionTag) => void;
}

/**
 * Subject + Unit dropdowns for tagging the next question in a Subjective test, so Records
 * can later break performance down by topic. Selection stays sticky across questions —
 * callers keep applying `value` until the user changes it.
 */
export default function UnitPicker({ value, onChange }: Props) {
  const subject = value?.subject ?? SUBJECTS[0];
  const groups = SUBJECT_UNIT_GROUPS[subject];
  const firstUnit = useMemo(() => groups[0].units[0], [groups]);

  function handleSubjectChange(nextSubject: Subject) {
    const nextGroups = SUBJECT_UNIT_GROUPS[nextSubject];
    onChange({ subject: nextSubject, unit: nextGroups[0].units[0] });
  }

  return (
    <div className={styles.picker} role="group" aria-label="Question topic">
      <label className={styles.field}>
        <span>Subject</span>
        <select value={subject} onChange={(e) => handleSubjectChange(e.target.value as Subject)}>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span>Unit</span>
        <select
          value={value?.unit ?? firstUnit}
          onChange={(e) => onChange({ subject, unit: e.target.value })}
        >
          {groups.map((group) => {
            const options = group.units.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ));
            return group.group ? (
              <optgroup key={group.group} label={group.group}>
                {options}
              </optgroup>
            ) : (
              options
            );
          })}
        </select>
      </label>
    </div>
  );
}
