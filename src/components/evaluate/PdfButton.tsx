import styles from "./PdfButton.module.css";

interface Props {
  disabled: boolean;
}

export default function PdfButton({ disabled }: Props) {
  return (
    <button
      type="button"
      className={styles.button}
      disabled={disabled}
      onClick={() => window.print()}
    >
      Save & share as PDF
    </button>
  );
}
