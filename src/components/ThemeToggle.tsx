"use client";

import type { MouseEvent } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { popAnimation, vibrate } from "@/lib/motion";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    popAnimation(event.currentTarget);
    vibrate(10);
    toggleTheme();
  }

  return (
    <button
      type="button"
      className={styles.button}
      onClick={handleClick}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {theme === "dark" ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  );
}
