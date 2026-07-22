import type { ExamType } from "@/lib/presets";
import { EXAM_LABELS } from "@/lib/presets";
import styles from "./ExamTypeFilter.module.css";

interface Props {
  value: ExamType;
  onChange: (examType: ExamType) => void;
}

export default function ExamTypeFilter({ value, onChange }: Props) {
  return (
    <label className={styles.field}>
      <span>Exam</span>
      <select value={value} onChange={(e) => onChange(e.target.value as ExamType)}>
        {(Object.keys(EXAM_LABELS) as ExamType[]).map((type) => (
          <option key={type} value={type}>
            {EXAM_LABELS[type]}
          </option>
        ))}
      </select>
    </label>
  );
}
