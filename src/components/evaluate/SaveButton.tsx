import styles from "./SaveButton.module.css";

interface Props {
  disabled: boolean;
  onSave: () => void;
}

export default function SaveButton({ disabled, onSave }: Props) {
  return (
    <button type="button" className={styles.button} disabled={disabled} onClick={onSave}>
      Save to Records
    </button>
  );
}
