"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import styles from "./Nav.module.css";

const TABS = [
  { href: "/evaluate", label: "Evaluate" },
  { href: "/records", label: "Records" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Main">
      <div className={styles.row}>
        <ul className={styles.list}>
          {TABS.map((tab) => {
            const isActive = pathname?.startsWith(tab.href);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={styles.link}
                  aria-current={isActive ? "page" : undefined}
                  data-active={isActive || undefined}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <ThemeToggle />
      </div>
    </nav>
  );
}
