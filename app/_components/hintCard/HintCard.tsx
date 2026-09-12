import type { HTMLAttributes } from 'react';
import styles from './HintCard.module.css';

export type HintCardProps = {
  /**
   * The hint itself. Figma's Body is a plain text layer rather than an exposed
   * component property, so this has no Figma name to match and no default.
   */
  body: string;
} & Omit<HTMLAttributes<HTMLElement>, 'children'>;

/**
 * A supportive hint surface for a recall question, shown when the student asks
 * for help before or during their spoken answer.
 *
 * Reach for it inside the question bottom sheet.
 *
 * Don't use it to reveal the correct answer outright; it should nudge, not
 * solve.
 */
export function HintCard({ body, className, ...rest }: HintCardProps) {
  const classes = [styles.hintCard, className].filter(Boolean).join(' ');

  return (
    // role="note" marks it as an aside about the question rather than part of
    // it, so the hint is announced as supporting content.
    <section className={classes} role="note" {...rest}>
      {/* Figma's Label is the fixed word "Hint" — not a property, so it isn't
          one here either. */}
      <p className={styles.label}>Hint</p>
      <p className={styles.body}>{body}</p>
    </section>
  );
}
