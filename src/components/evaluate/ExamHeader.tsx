import type { ExamType } from "@/lib/presets";
import { EXAM_LABELS } from "@/lib/presets";
import styles from "./ExamHeader.module.css";

interface Props {
  examType: ExamType;
  title: string;
  student: string;
  correctMark: number;
  wrongMark: number;
  totalQ: number;
  onExamTypeChange: (examType: ExamType) => void;
  onTitleChange: (title: string) => void;
  onStudentChange: (student: string) => void;
  onCorrectMarkChange: (value: number) => void;
  onWrongMarkChange: (value: number) => void;
  onTotalQChange: (value: number) => void;
}

export default function ExamHeader({
  examType,
  title,
  student,
  correctMark,
  wrongMark,
  totalQ,
  onExamTypeChange,
  onTitleChange,
  onStudentChange,
  onCorrectMarkChange,
  onWrongMarkChange,
  onTotalQChange,
}: Props) {
  return (
    <section className={styles.header} aria-label="Sheet details">
      <div className={styles.row}>
        <fieldset className={styles.examField}>
          <legend className={styles.examLegend}>Exam</legend>
          <div className={styles.segmented}>
            {(Object.keys(EXAM_LABELS) as ExamType[]).map((type) => (
              <label key={type} className={styles.segment}>
                <input
                  type="radio"
                  name="examType"
                  value={type}
                  checked={examType === type}
                  onChange={() => onExamTypeChange(type)}
                  className="sr-only"
                />
                <span>{EXAM_LABELS[type]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className={styles.field}>
          <span>Title</span>
          <input
            type="text"
            value={title}
            placeholder="e.g. Mock Test 3"
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>Student / Roll no.</span>
          <input
            type="text"
            value={student}
            placeholder="Optional"
            onChange={(e) => onStudentChange(e.target.value)}
          />
        </label>
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Correct</span>
          <input
            type="number"
            data-numeric
            value={correctMark}
            onChange={(e) => onCorrectMarkChange(Number(e.target.value))}
          />
        </label>

        <label className={styles.field}>
          <span>Wrong</span>
          <input
            type="number"
            data-numeric
            value={wrongMark}
            onChange={(e) => onWrongMarkChange(Number(e.target.value))}
          />
        </label>

        <label className={styles.field}>
          <span>Total Qs</span>
          <input
            type="number"
            data-numeric
            min={1}
            value={totalQ}
            onChange={(e) => onTotalQChange(Number(e.target.value))}
          />
        </label>
      </div>
    </section>
  );
}
