import type { HTMLAttributes } from 'react';
import styles from './StatusBar.module.css';

export type StatusBarProps = {
  /**
   * The clock. Defaults to 09:41 — the time Apple has shown in every iPhone
   * announcement and mockup since 2007, and the time Figma's own Status Bar
   * instance carries. A real clock would make every screenshot differ from the
   * last for no reason.
   */
  time?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

/**
 * The iOS status bar: clock on the left, signal, wi-fi and battery on the
 * right.
 *
 * USE: (unverified) at the top of `Screen`, which reserves the region for it.
 *
 * DON'T: (unverified) don't read anything into it. It is device chrome, drawn
 * so a 390×844 screenshot looks like a phone rather than a browser tab —
 * nothing here reports real signal, real charge or the real time.
 *
 * Figma composes a `Status Bar` instance from an external library into every
 * flow screen's `Panel Header`, at `Mode=Night`. That library has no React
 * build, so this redraws its geometry: the clock at `Space/600` from the left,
 * the three glyphs `Space/150` apart and `Space/400` from the right.
 */
export function StatusBar({ time = '09:41', className, ...rest }: StatusBarProps) {
  const classes = [styles.statusBar, className].filter(Boolean).join(' ');

  return (
    // Chrome, not content: hidden from assistive tech entirely. A screen
    // reader announcing a fake battery level would be worse than silence.
    <div className={classes} aria-hidden="true" {...rest}>
      <span className={styles.time}>{time}</span>

      <span className={styles.glyphs}>
        {/* Figma "Cellular Connection": four bars, 16×11, ascending. */}
        <svg className={styles.cellular} viewBox="0 0 16 11" fill="none">
          <rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor" />
          <rect x="4.5" y="5" width="3" height="6" rx="1" fill="currentColor" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="currentColor" />
          <rect x="13" y="0" width="3" height="11" rx="1" fill="currentColor" />
        </svg>

        {/* Figma "Wifi": 15×11. Three arcs rather than Figma's filled wedges —
            at 12px the stroke reads more clearly than the solid form. */}
        <svg className={styles.wifi} viewBox="0 0 15 11" fill="none">
          <path
            d="M1 3.4Q7.5-1.4 14 3.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M3.4 6.3Q7.5 3 11.6 6.3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M5.9 9.1Q7.5 7.7 9.1 9.1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>

        {/* Figma "Battery": a 22×11 border, a 1×4 cap, and an 18×7 capacity
            bar — drawn full, because nothing here has a battery to report. */}
        <svg className={styles.battery} viewBox="0 0 24 11" fill="none">
          <rect
            x="0.5"
            y="0.5"
            width="21"
            height="10"
            rx="3"
            stroke="currentColor"
            strokeOpacity="0.4"
          />
          <rect x="2" y="2" width="18" height="7" rx="1.5" fill="currentColor" />
          <path
            d="M23 4v3a2 2 0 0 0 0-3Z"
            fill="currentColor"
            fillOpacity="0.4"
          />
        </svg>
      </span>
    </div>
  );
}
