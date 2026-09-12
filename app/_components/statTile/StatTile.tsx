import type { HTMLAttributes } from 'react';
import styles from './StatTile.module.css';

export type StatTileProps = {
  /**
   * What the number is, e.g. "XP". Figma's Label is a plain text layer rather
   * than an exposed component property, so this has no Figma name to match and
   * no default. Keep it to a word or two.
   */
  label: string;
  /**
   * The number itself, e.g. "+18". A plain text layer in Figma too, so it takes
   * a string rather than a number — the "+" and the "%" are part of the value.
   */
  value: string;
} & Omit<HTMLAttributes<HTMLElement>, 'children'>;

/**
 * A compact badge that surfaces a single numeric stat (XP earned, streak count,
 * accuracy percent) tied to accent/blue.
 *
 * Reach for it inline after a recall attempt or on a summary screen when one
 * number deserves emphasis.
 *
 * Don't use it for multi-line content or anything longer than a short label +
 * short value; it isn't a card.
 */
export function StatTile({ label, value, className, ...rest }: StatTileProps) {
  const classes = [styles.statTile, className].filter(Boolean).join(' ');

  return (
    // A label/value pair, marked up as one: the description list ties the two
    // together for screen readers, which a pair of bare spans would not.
    <dl className={classes} {...rest}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{value}</dd>
    </dl>
  );
}
