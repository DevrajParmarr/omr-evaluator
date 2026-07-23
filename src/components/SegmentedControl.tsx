"use client";

import { useLayoutEffect, useRef } from "react";
import { animate } from "motion/mini";
import { prefersReducedMotion } from "@/lib/motion";
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
  const trackRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<(HTMLLabelElement | null)[]>([]);
  const hasMounted = useRef(false);
  const activeIndex = options.indexOf(value);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const indicator = indicatorRef.current;
    const activeSegment = segmentRefs.current[activeIndex];
    if (!track || !indicator || !activeSegment) return;

    const reposition = () => {
      const trackRect = track.getBoundingClientRect();
      const activeRect = activeSegment.getBoundingClientRect();
      const x = activeRect.left - trackRect.left;
      const width = activeRect.width;

      if (!hasMounted.current || prefersReducedMotion()) {
        indicator.style.transform = `translateX(${x}px)`;
        indicator.style.width = `${width}px`;
        return;
      }
      animate(indicator, { x, width }, { duration: 0.25, ease: [0.22, 1, 0.36, 1] });
    };

    reposition();
    hasMounted.current = true;

    // Segment widths can change on reflow (e.g. viewport resize) without `value` changing.
    const observer = new ResizeObserver(reposition);
    observer.observe(track);
    return () => observer.disconnect();
  }, [activeIndex]);

  return (
    <fieldset className={`${styles.field} ${className ?? ""}`}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.segmented} ref={trackRef}>
        <div className={styles.indicator} ref={indicatorRef} aria-hidden="true" />
        {options.map((option, index) => (
          <label
            key={option}
            className={styles.segment}
            ref={(el) => {
              segmentRefs.current[index] = el;
            }}
          >
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
