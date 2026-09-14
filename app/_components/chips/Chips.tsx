import type { HTMLAttributes, ReactNode } from 'react';
import { SquareIcon } from '../button/icons';
import styles from './Chips.module.css';

/** Figma variant property `size`. */
export type ChipsSize = 'XXS' | 'XS' | 'S' | 'M';
/**
 * Figma variant property `color`, plus two hues this build adds.
 *
 * `Primary` and `pro` are Figma's. `pro` is unverified — no real instance uses
 * it. `magenta` and `blue` are **not in the Figma component set**: they were
 * added for the spent-hint chips on the turn screens, which needed two
 * distinguishable fills. Both use the accent family's bold/onBold pairing,
 * which measures 6.77:1 (magenta) and 6.64:1 (blue) for the label on the fill.
 *
 * design-system.md records the hue-named accents as existing debt — "not a
 * pattern to extend". These *use* two that already exist rather than adding a
 * new hue-named token, which is the line that note draws.
 */
export type ChipsColor = 'Primary' | 'pro' | 'magenta' | 'blue';

/**
 * Icon box per size, from the iconSlot instances nested in each Figma variant:
 * XXS/XS -> Icon/150, S -> Icon/200, M -> Icon/250.
 */
const ICON_SIZE: Record<ChipsSize, string> = {
  XXS: 'var(--dimension-icon-150)',
  XS: 'var(--dimension-icon-150)',
  S: 'var(--dimension-icon-200)',
  M: 'var(--dimension-icon-250)',
};

const SIZE_CLASS: Record<ChipsSize, string> = {
  XXS: styles.sizeXXS,
  XS: styles.sizeXS,
  S: styles.sizeS,
  M: styles.sizeM,
};

const COLOR_CLASS: Record<ChipsColor, string> = {
  Primary: styles.colorPrimary,
  pro: styles.colorPro,
  magenta: styles.colorMagenta,
  blue: styles.colorBlue,
};

export type ChipsProps = {
  /** Figma variant `size`. */
  size?: ChipsSize;
  /** Figma variant `color`. Only changes anything when `active` is true. */
  color?: ChipsColor;
  /** Figma variant `active` (`True`/`False`). Visual emphasis only. */
  active?: boolean;
  /** Figma property `Text` — the label. One or two words, sentence case. */
  Text?: string;
  /** Figma property `showLeftIcon`. */
  showLeftIcon?: boolean;
  /** Figma property `showRightIcon`. */
  showRightIcon?: boolean;
  /** Fills the left iconSlot. Falls back to Figma's `square` placeholder. */
  leftIcon?: ReactNode;
  /** Fills the right iconSlot. Falls back to Figma's `square` placeholder. */
  rightIcon?: ReactNode;
  /**
   * Makes the chip a control. Not a Figma property: the component set is a
   * static label. Given a handler, the chip renders as a real `<button>` —
   * keyboard, focus ring and a Target/Minimum hit area included — and without
   * one it stays the plain label it always was.
   */
  onClick?: () => void;
} & Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'color' | 'onClick'>;

/**
 * Compact label with optional side icons, 4 sizes, 2 colors, active/inactive.
 *
 * USE: 1-2 word labels (default placeholder "1/2 words"). Real usage mostly
 * S/Primary/inactive.
 *
 * DON'T: most real instances still carry the unedited placeholder text, only 2
 * of 11 have real copy, don't treat these mockups as final chip content. The
 * "pro" color option is never used in a real instance, unverified.
 */
export function Chips({
  size = 'XXS',
  color = 'Primary',
  active = false,
  Text = '1/2 words',
  showLeftIcon = true,
  showRightIcon = true,
  leftIcon,
  rightIcon,
  onClick,
  className,
  ...rest
}: ChipsProps) {
  const iconSize = ICON_SIZE[size];

  const classes = [
    styles.chip,
    SIZE_CLASS[size],
    active ? COLOR_CLASS[color] : styles.inactive,
    onClick ? styles.interactive : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {showLeftIcon ? (
        <span className={styles.icon}>
          {leftIcon ?? <SquareIcon size={iconSize} />}
        </span>
      ) : null}
      <span className={styles.label}>{Text}</span>
      {showRightIcon ? (
        <span className={styles.icon}>
          {rightIcon ?? <SquareIcon size={iconSize} />}
        </span>
      ) : null}
    </>
  );

  // A control is a button; a label is a span. Making a span clickable would
  // cost keyboard access and the accessibility role for nothing.
  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        onClick={onClick}
        {...(rest as HTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={classes} {...rest}>
      {content}
    </span>
  );
}
