import type { ExamType } from "@/lib/presets";
import ExamTypePicker from "@/components/ExamTypePicker";

interface Props {
  value: ExamType;
  onChange: (examType: ExamType) => void;
}

export default function ExamTypeFilter({ value, onChange }: Props) {
  return <ExamTypePicker value={value} onChange={onChange} name="examTypeFilter" />;
}
