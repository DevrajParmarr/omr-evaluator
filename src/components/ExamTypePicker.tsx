import type { ExamType } from "@/lib/presets";
import { EXAM_LABELS } from "@/lib/presets";
import styles from "./ExamTypePicker.module.css";

interface Props {
  value: ExamType;
  onChange: (examType: ExamType) => void;
  label?: string;
  name?: string;
  className?: string;
}

/** Segmented pill control for picking an exam type, shared by Evaluate's header and Records' filter. */
export default function ExamTypePicker({
  value,
  onChange,
  label = "Exam",
  name = "examType",
  className,
}: Props) {
  return (
    <fieldset className={`${styles.field} ${className ?? ""}`}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.segmented}>
        {(Object.keys(EXAM_LABELS) as ExamType[]).map((type) => (
          <label key={type} className={styles.segment}>
            <input
              type="radio"
              name={name}
              value={type}
              checked={value === type}
              onChange={() => onChange(type)}
              className="sr-only"
            />
            <span>{EXAM_LABELS[type]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
