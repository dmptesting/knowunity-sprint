'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';
import styles from './PhoneFrame.module.css';

export type PhoneFrameProps = { children: ReactNode };

/** The iPhone 12/13/14 screen. Device dimensions, not design values. */
const PHONE_HEIGHT = 844;

/**
 * A 390×844 device frame, centred in the browser.
 *
 * **Prototype chrome, not design system.** 390 and 844 are the iPhone
 * 12/13/14 screen, and neither is a token — `Responsive/Device Width` holds
 * 375/768/1200, none of which is this prototype's width. They are device
 * dimensions rather than design values, so they live here, in the harness
 * around the design, rather than inside `Screen`.
 *
 * Three cases, and the middle one is the one that was wrong:
 *
 * - **A window tall enough** — the phone at exactly 390×844.
 * - **A wide window too short to hold it** — most laptops. The phone keeps its
 *   exact 390×844 layout and is *scaled* to fit the height, so every control
 *   stays on screen without scrolling. This used to switch to full-bleed
 *   instead, which on a 1440×800 window rendered the "phone" 1440 pixels wide.
 * - **An actual phone** — no frame at all; the app fills the device.
 *
 * Scaling is a CSS transform, which the browser accounts for in hit-testing
 * and in `getBoundingClientRect`, so the hold-to-speak gesture and its
 * slide-away radius measure correctly at any scale.
 */
export function PhoneFrame({ children }: PhoneFrameProps) {
  const stage = useRef<HTMLDivElement>(null);

  // Before paint, so a short window never flashes an unscaled phone.
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;

    const fit = () => {
      // Read the stage's own padding rather than restating the token here.
      const style = getComputedStyle(el);
      const padding =
        parseFloat(style.paddingBlockStart) + parseFloat(style.paddingBlockEnd);
      const available = window.innerHeight - padding;
      const scale = Math.min(1, available / PHONE_HEIGHT);
      el.style.setProperty('--phone-scale', String(scale));
    };

    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  return (
    <div ref={stage} className={styles.stage}>
      <div className={styles.phone}>{children}</div>
    </div>
  );
}
