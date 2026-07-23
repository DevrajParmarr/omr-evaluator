import type { ExamType } from "@/lib/presets";
import { EXAM_LABELS } from "@/lib/presets";
import SegmentedControl from "@/components/SegmentedControl";

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
    <SegmentedControl
      value={value}
      onChange={onChange}
      options={Object.keys(EXAM_LABELS) as ExamType[]}
      getLabel={(type) => EXAM_LABELS[type]}
      label={label}
      name={name}
      className={className}
    />
  );
}
