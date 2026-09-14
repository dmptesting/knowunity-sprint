import type { HTMLAttributes, ReactNode } from 'react';
import { BoltIcon, TargetIcon, TimerIcon } from '../icons/UiIcons';
import styles from './StatTile.module.css';

/**
 * Which stat the tile shows. lowerCamelCase, like this sprint's other category
 * axes — design-system.md reserves Title Case for emphasis and size. Each one
 * sets the tile's accent, its icon and its default label.
 */
export type StatTileStat = 'xp' | 'correct' | 'time';

const ICON_SIZE = 'var(--dimension-icon-200)';

const STAT: Record<StatTileStat, { label: string; icon: ReactNode; className: string }> = {
  xp: { label: 'XP', icon: <BoltIcon size={ICON_SIZE} />, className: styles.xp },
  correct: { label: 'Correct', icon: <TargetIcon size={ICON_SIZE} />, className: styles.correct },
  time: { label: 'Time', icon: <TimerIcon size={ICON_SIZE} />, className: styles.time },
};

export type StatTileProps = {
  /** Which stat: sets the accent colour, the icon and the default label. */
  stat: StatTileStat;
  /**
   * What the number is. Defaults to the stat's own label — "XP", "Correct" or
   * "Time". Keep any override to a word or two.
   */
  label?: string;
  /**
   * The number itself, e.g. "+18". A plain text layer in Figma too, so it takes
   * a string rather than a number — the "+" and the "%" are part of the value.
   */
  value: string;
} & Omit<HTMLAttributes<HTMLElement>, 'children'>;

/**
 * A compact badge that surfaces a single numeric stat — XP earned, number
 * correct, or time taken — each in its own accent with its own icon.
 *
 * Reach for it inline after a recall attempt or on a summary screen when one
 * number deserves emphasis.
 *
 * Don't use it for multi-line content or anything longer than a short label +
 * short value; it isn't a card.
 */
export function StatTile({ stat, label, value, className, ...rest }: StatTileProps) {
  const config = STAT[stat];
  const classes = [styles.statTile, config.className, className].filter(Boolean).join(' ');

  return (
    // A label/value pair, marked up as one: the description list ties the two
    // together for screen readers, which a pair of bare spans would not.
    <dl className={classes} {...rest}>
      <dt className={styles.label}>{label ?? config.label}</dt>
      <dd className={styles.value}>
        {/* Decorative: the label already says what the number is. */}
        <span className={styles.icon} aria-hidden="true">
          {config.icon}
        </span>
        {value}
      </dd>
    </dl>
  );
}
