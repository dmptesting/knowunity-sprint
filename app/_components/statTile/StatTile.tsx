import type { HTMLAttributes, ReactNode } from 'react';
import { BoltIcon, TargetIcon, TimerIcon } from '../icons/UiIcons';
import styles from './StatTile.module.css';

/**
 * Which stat the tile shows. lowerCamelCase, like this sprint's other category
 * axes — design-system.md reserves Title Case for emphasis and size. Each one
 * sets the tile's accent, its icon and its default label.
 */
export type StatTileStat = 'xp' | 'score' | 'blazing';

const ICON_SIZE = 'var(--dimension-icon-300)';

// `blazing` names the variant and its accent, not the label: Figma writes
// "BLAZING" over the elapsed time, which would praise a slow run as readily as
// a fast one. The visible label stays "Time"; callers can override it.
const STAT: Record<StatTileStat, { label: string; icon: ReactNode; className: string }> = {
  xp: { label: 'XP', icon: <BoltIcon size={ICON_SIZE} />, className: styles.xp },
  score: { label: 'Score', icon: <TargetIcon size={ICON_SIZE} />, className: styles.score },
  blazing: { label: 'Time', icon: <TimerIcon size={ICON_SIZE} />, className: styles.blazing },
};

export type StatTileProps = {
  /** Which stat: sets the accent colour, the icon and the default label. */
  stat: StatTileStat;
  /**
   * What the number is. Defaults to the stat's own label — "XP", "Score" or
   * "Time". Keep any override to a word or two.
   */
  label?: string;
  /**
   * The number itself, e.g. "+18". A plain text layer in Figma too, so it takes
   * a string rather than a number — the "+" and the "/" are part of the value.
   */
  value: string;
} & Omit<HTMLAttributes<HTMLElement>, 'children'>;

/**
 * A compact tile that surfaces a single stat — XP earned, score, or time taken
 * — each in its own accent with its own icon: a coloured chip naming the stat,
 * and the number below it on the page's own dark ground.
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
