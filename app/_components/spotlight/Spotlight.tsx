'use client';

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import styles from './Spotlight.module.css';

/**
 * The body's text style, named for the Figma headline it uses: `XL` is
 * Greed/Headline XL (44px), down to `S`, Greed/Headline S (21px).
 */
export type SpotlightSize = 'XL' | 'L' | 'M' | 'S';

/**
 * The label's text style: `S` is Greed/Caption M Bold (12px), `M` is
 * Greed/Headline XS Bold (18px), `L` is Greed/Headline S (21px).
 */
export type SpotlightLabelSize = 'S' | 'M' | 'L';

const LABEL_SIZE_CLASS: Record<SpotlightLabelSize, string> = {
  S: styles.labelS,
  M: styles.labelM,
  L: styles.labelL,
};

const SIZE_CLASS: Record<SpotlightSize, string> = {
  XL: styles.sizeXl,
  L: styles.sizeL,
  M: styles.sizeM,
  S: styles.sizeS,
};

export type SpotlightProps = {
  /**
   * The label above, e.g. "Hint 1" or "Answer". Its size is set by
   * `labelSize`, never by `size`. Sentence case.
   */
  label: string;
  /** The label's text style. Defaults to `S`. Independent of `size`. */
  labelSize?: SpotlightLabelSize;
  /** Put on the label, so a dialog around the spotlight can be named by it. */
  labelId?: string;
  /** The one thing the screen is showing. */
  body: string;
  /** The body's text style. Defaults to `XL`. Only the body changes size. */
  size?: SpotlightSize;
  /**
   * Moves focus onto the body when it mounts. Turn it on when the spotlight
   * replaces the screen without the student's focus moving, so a screen reader
   * is not left on the button they just left. The body is not a tab stop.
   */
  focusOnMount?: boolean;
  /** An optional quiet line under the body, at Caption M in text/secondary. */
  footnote?: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

/**
 * One piece of information given the whole screen: a small label, then the
 * body large and centred, and optionally a quiet footnote.
 *
 * USE: a screen that exists to show a single statement — a hint, a revealed
 * answer. Fill the screen's content region with it; it centres itself in the
 * space it is given.
 *
 * DON'T: put Knowie or a bubble beside it — it is the page's whole voice. And
 * don't use it for copy longer than a short paragraph; step `size` down
 * before the body has to scroll.
 */
export function Spotlight({
  label,
  labelSize = 'S',
  labelId,
  body,
  size = 'XL',
  focusOnMount = false,
  footnote,
  className,
  ...rest
}: SpotlightProps) {
  const bodyRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (focusOnMount) bodyRef.current?.focus();
  }, [focusOnMount]);

  const classes = [styles.spotlight, className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      <p className={`${styles.label} ${LABEL_SIZE_CLASS[labelSize]}`} id={labelId}>
        {label}
      </p>
      <p
        ref={bodyRef}
        className={`${styles.body} ${SIZE_CLASS[size]}`}
        tabIndex={focusOnMount ? -1 : undefined}
      >
        {body}
      </p>
      {footnote ? <p className={styles.footnote}>{footnote}</p> : null}
    </div>
  );
}
