import styles from "./Toast.module.css";

interface Props {
  message: string | null;
}

export default function Toast({ message }: Props) {
  return (
    <div className={styles.wrapper} aria-live="polite">
      {message && <p className={styles.toast}>{message}</p>}
    </div>
  );
}
