import type { HTMLAttributes } from 'react';
import styles from './VerdictHeader.module.css';

/**
 * Which way the attempt was judged. lowerCamelCase values, matching the
 * `mode` / `progress` / `format` axes this sprint's other components use —
 * design-system.md reserves Title Case for emphasis and size.
 */
export type Verdict = 'pass' | 'partial' | 'fail';

const VERDICT_CLASS: Record<Verdict, string> = {
  pass: styles.pass,
  partial: styles.partial,
  fail: styles.fail,
};

export type VerdictHeaderProps = {
  /** Which way the attempt was judged. */
  verdict: Verdict;
  /**
   * The word itself — "Correct", "Close", "Not quite". Required and with no
   * default, so the header can never ship placeholder copy.
   */
  label: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

/**
 * The verdict that opens a result screen: the word, coloured by how it went.
 *
 * **Not used anywhere in the app.** It was built for the full-page Result
 * screen, which was removed on 2026-09-15 when the result sheet became the
 * verdict design. Kept as a documented component; its `Verdict` type is still
 * the one definition of pass/partial/fail.
 *
 * USE: (unverified) at the top of a result state, above the transcript and the
 * feedback.
 *
 * DON'T: (unverified) don't reach for it to label anything that isn't a
 * judgement of an attempt — it is the recall loop's verdict, not a generic
 * status chip.
 *
 * **No mark.** This was built as an icon-plus-word pairing, reproducing the
 * green check-circle Figma screen 06 draws with a bare `Icon Slot`. The
 * checkmark was dropped on the designer's instruction: on a pass the result
 * screen now carries a large `giggling` mascot, and a tick beside it was one
 * affirmation too many. Nothing draws a mark on a miss either — SPEC.md is
 * explicit that "the distinction stays in copy" — so the component is the word
 * alone.
 *
 * The word still carries the verdict for anyone who cannot read the mascot's
 * expression, which is why it was kept when the mark went.
 */
export function VerdictHeader({
  verdict,
  label,
  className,
  ...rest
}: VerdictHeaderProps) {
  const classes = [styles.verdictHeader, VERDICT_CLASS[verdict], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      <p className={styles.label}>{label}</p>
    </div>
  );
}
