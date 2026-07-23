import styles from "./SegmentedControl.module.css";

interface Props<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly T[];
  getLabel?: (option: T) => string;
  label: string;
  name: string;
  className?: string;
}

/** Generic segmented pill control (radio group styled as buttons), e.g. exam type or subject. */
export default function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  getLabel = (option) => option,
  label,
  name,
  className,
}: Props<T>) {
  return (
    <fieldset className={`${styles.field} ${className ?? ""}`}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.segmented}>
        {options.map((option) => (
          <label key={option} className={styles.segment}>
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            <span>{getLabel(option)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
