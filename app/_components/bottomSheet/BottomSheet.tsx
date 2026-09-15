'use client';

import { useEffect, useId, useRef, type HTMLAttributes, type RefObject } from 'react';
import { MascotSlot, type MascotExpression } from '../mascotSlot/MascotSlot';
import styles from './BottomSheet.module.css';

/**
 * Figma variant property `result`. lowerCamelCase, like this sprint's other
 * status axes — design-system.md reserves Title Case for emphasis and size.
 *
 * `unsure` is not a verdict: the recording came through distorted, so there is
 * nothing to judge yet. `reveal` ends the hint ladder: both hints are spent and
 * the second re-attempt missed, so the only way is forward, to the answer.
 * Neither is in the Figma set.
 */
export type BottomSheetResult = 'correct' | 'incorrect' | 'unsure' | 'reveal';

/** Which hint an incorrect sheet offers: the first after one miss, the second after two. */
export type BottomSheetHint = 1 | 2;

/** Knowie's expression for each result, unless `expression` overrides it. */
const RESULT_EXPRESSION: Record<BottomSheetResult, MascotExpression> = {
  correct: 'excited',
  incorrect: 'confused',
  unsure: 'thinking',
  // Neutral on purpose. The student reached this by running out of hints — the
  // worst moment to wear a reaction at them (SPEC.md: "Knowie never wears a
  // reaction aimed at a student who struggled"). SPEC.md's reveal screen uses
  // `thinking`, but that is now the unsure sheet's face.
  reveal: 'standby',
};

const RESULT_CLASS: Record<BottomSheetResult, string> = {
  correct: styles.correct,
  incorrect: styles.incorrect,
  unsure: styles.unsure,
  reveal: styles.reveal,
};

export type BottomSheetProps = {
  /** Figma variant `result`. Sets the panel and button colours. */
  result?: BottomSheetResult;
  /**
   * The verdict, e.g. "You are right!". Required and with no default, so the
   * sheet can never ship placeholder copy.
   */
  title: string;
  /**
   * One or two sentences on why — the explanation, not a restatement of the
   * verdict. It must fit without scrolling, beside a one-line title: about six
   * lines (roughly 130 characters) on a correct sheet, but only about three
   * (roughly 65) on an incorrect or unsure one, whose second button takes the room;
   * a reveal sheet has one button, so it gets the correct sheet's room. A
   * title that wraps costs a line. Leave slack: browsers wrap slightly
   * differently. The sheet never scrolls and the title never shrinks; copy that
   * outgrows it is clipped and logs a warning in development.
   */
  summary: string;
  /**
   * The main button's label. Defaults to "Next question" on a correct sheet
   * ("View results" when `lastQuestion`), "Try again" on an incorrect or unsure
   * one, and "Reveal answer" on a reveal one. Sentence case.
   */
  ctaLabel?: string;
  /**
   * Correct sheet only: this was the session's last question, so there is no
   * next one — the button reads "View results" and leads to the summary with
   * the stat tiles. Same `onContinue`; only the words change.
   */
  lastQuestion?: boolean;
  /**
   * Incorrect sheet only: which hint the second button opens. Defaults to 1.
   * Sets the default label, "View hint 1" or "View hint 2".
   */
  hint?: BottomSheetHint;
  /** Overrides the second button's label on an incorrect sheet. Sentence case. */
  hintLabel?: string;
  /** The second button's label on an unsure sheet. Sentence case. */
  skipLabel?: string;
  /**
   * Knowie's expression, passed straight to mascotSlot. Defaults to `excited`
   * for a correct answer, `confused` for an incorrect one, `thinking` for an
   * unsure one and `standby` for a reveal. Only `standby` is verified in real
   * use (design-system.md).
   */
  expression?: MascotExpression;
  /** Correct sheet: tapped "Next question", or "View results" on the last question. */
  onContinue?: () => void;
  /** Incorrect or unsure sheet: tapped "Try again". */
  onTryAgain?: () => void;
  /** Incorrect sheet: tapped "View hint 1" or "View hint 2". Receives which. */
  onViewHint?: (hint: BottomSheetHint) => void;
  /** Unsure sheet: tapped "Skip question". */
  onSkip?: () => void;
  /** Reveal sheet: tapped "Reveal answer". */
  onReveal?: () => void;
} & Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'>;

/**
 * The sheet that rises after a quiz answer is checked: Knowie beside the
 * verdict and a short summary of why. A correct answer gets one button to move
 * on — "Next question", or "View results" after the last question; an incorrect one gets "Try again" above "View hint 1" or "View hint 2". An unsure sheet —
 * the recording came through distorted — gets "Try again" above "Skip
 * question", so the student is never stuck re-recording. A reveal sheet — both
 * hints spent, still missed — gets one button, "Reveal answer": the only way on
 * is forward.
 *
 * USE: the voice-recall verdict — `correct` for a pass, `incorrect` for a
 * partial or a fail, told apart by the title; `unsure` when a voice recording
 * came through too distorted to judge; `reveal` when the hint ladder is spent
 * and the answer has to be shown.
 *
 * DON'T: paint anything red or warning-coloured on `incorrect` — SPEC.md
 * forbids an error treatment behind a miss — and don't collapse partial and
 * fail into one title; sprint-context.md keeps the three-way judgment.
 */
export function BottomSheet({
  result = 'correct',
  title,
  summary,
  ctaLabel,
  lastQuestion = false,
  hint = 1,
  hintLabel,
  skipLabel = 'Skip question',
  expression,
  onContinue,
  onTryAgain,
  onViewHint,
  onSkip,
  onReveal,
  className,
  ...rest
}: BottomSheetProps) {
  const titleId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  useOverflowWarning(
    contentRef,
    // The result changes the action row's height, and so the room left.
    `${result}\n${title}\n${summary}`,
  );

  const primary =
    result === 'correct'
      ? { label: lastQuestion ? 'View results' : 'Next question', onClick: onContinue }
      : result === 'reveal'
        ? { label: 'Reveal answer', onClick: onReveal }
        : { label: 'Try again', onClick: onTryAgain };
  const secondary =
    result === 'incorrect'
      ? { label: hintLabel ?? `View hint ${hint}`, onClick: () => onViewHint?.(hint) }
      : result === 'unsure'
        ? { label: skipLabel, onClick: onSkip }
        : null;

  const classes = [styles.bottomSheet, RESULT_CLASS[result], className]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes} aria-labelledby={titleId} {...rest}>
      <span className={styles.grabber} aria-hidden="true" />

      <div ref={contentRef} className={styles.content}>
        {/* Decorative: the title and summary carry every word. */}
        <MascotSlot size="2XL" expression={expression ?? RESULT_EXPRESSION[result]} />
        <div className={styles.text}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <p className={styles.summary}>{summary}</p>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.cta} ${styles.ctaPrimary}`}
          onClick={primary.onClick}
        >
          {ctaLabel ?? primary.label}
        </button>
        {secondary ? (
          <button
            type="button"
            className={`${styles.cta} ${styles.ctaSecondary}`}
            onClick={secondary.onClick}
          >
            {secondary.label}
          </button>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Warns in development when the copy is taller than the sheet leaves room for.
 * The sheet never scrolls and the title never shrinks — a title that changed
 * size to fit would differ from sheet to sheet — so copy that overflows is a
 * content error to fix at the source.
 *
 * Checked again once the web font is in: the wider fallback font can overflow
 * for a frame even when the real copy fits.
 */
function useOverflowWarning(contentRef: RefObject<HTMLDivElement | null>, copy: string) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const content = contentRef.current;
    if (!content) return;

    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled || content.scrollHeight <= content.clientHeight) return;
      console.warn(
        'bottomSheet: the title and summary are too long to fit. Shorten the copy — the sheet does not scroll.',
      );
    });
    return () => {
      cancelled = true;
    };
  }, [contentRef, copy]);
}
