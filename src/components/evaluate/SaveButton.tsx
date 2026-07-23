import type { MouseEvent } from "react";
import { popAnimation } from "@/lib/motion";
import styles from "./SaveButton.module.css";

interface Props {
  disabled: boolean;
  onSave: () => void;
}

export default function SaveButton({ disabled, onSave }: Props) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    popAnimation(event.currentTarget);
    onSave();
  }

  return (
    <button type="button" className={styles.button} disabled={disabled} onClick={handleClick}>
      Save to Records
    </button>
  );
}
