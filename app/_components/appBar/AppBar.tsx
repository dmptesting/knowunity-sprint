'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import buttonStyles from '../button/Button.module.css';
import styles from './AppBar.module.css';
import { ArrowBackIcon, MoreVertIcon, ShareIcon } from '../icons/UiIcons';

/** Figma variant property `variant` — chosen by how many header actions the screen needs. */
export type AppBarVariant =
  | 'default'
  | 'leftIconButtonOnly'
  | 'leftAndRightIconButton'
  | 'leftAndRightButton'
  | 'leftAndTwoRightIconButtons'
  | 'leftAnd2RightButtons';

const VARIANT_CLASS: Record<AppBarVariant, string> = {
  default: styles.variantDefault,
  leftIconButtonOnly: styles.variantLeftIconButtonOnly,
  leftAndRightIconButton: styles.variantLeftAndRightIconButton,
  leftAndRightButton: styles.variantLeftAndRightButton,
  leftAndTwoRightIconButtons: styles.variantLeftAndTwoRightIconButtons,
  leftAnd2RightButtons: styles.variantLeftAnd2RightButtons,
};

/* Which slots each variant fills, read off the Figma variants one by one. */
const HAS_LEFT: Record<AppBarVariant, boolean> = {
  default: false,
  leftIconButtonOnly: true,
  leftAndRightIconButton: true,
  leftAndRightButton: true,
  leftAndTwoRightIconButtons: true,
  leftAnd2RightButtons: true,
};

const HAS_RIGHT_ICON: Record<AppBarVariant, boolean> = {
  default: false,
  leftIconButtonOnly: false,
  leftAndRightIconButton: true,
  leftAndRightButton: false,
  leftAndTwoRightIconButtons: true,
  leftAnd2RightButtons: true,
};

const HAS_SECOND_RIGHT_ICON: Record<AppBarVariant, boolean> = {
  default: false,
  leftIconButtonOnly: false,
  leftAndRightIconButton: false,
  leftAndRightButton: false,
  leftAndTwoRightIconButtons: true,
  leftAnd2RightButtons: false,
};

const HAS_RIGHT_CTA: Record<AppBarVariant, boolean> = {
  default: false,
  leftIconButtonOnly: false,
  leftAndRightIconButton: false,
  leftAndRightButton: true,
  leftAndTwoRightIconButtons: false,
  leftAnd2RightButtons: true,
};

export type AppBarProps = {
  /** Figma variant `variant`. */
  variant?: AppBarVariant;
  /**
   * Figma's `Slot` property. Set to stretch its child on insert, so whatever
   * goes here fills the space between the actions — a progressIndicator, a
   * title, a chip.
   */
  children?: ReactNode;
  /** The leading icon. Figma uses `arrow-left`, which always means back. */
  leftIcon?: ReactNode;
  /** Accessible name for the leading action. */
  leftLabel?: string;
  onLeftClick?: () => void;
  /**
   * The first trailing icon. Figma uses `dots-vertical`, except in
   * `leftAndTwoRightIconButtons` where the pair is `share-02` then
   * `dots-vertical`.
   */
  rightIcon?: ReactNode;
  /** Accessible name for the first trailing action. */
  rightLabel?: string;
  onRightClick?: () => void;
  /** The second trailing icon. `leftAndTwoRightIconButtons` only. */
  secondRightIcon?: ReactNode;
  /** Accessible name for the second trailing action. */
  secondRightLabel?: string;
  onSecondRightClick?: () => void;
  /**
   * Figma property `Text` on the nested App Bar Button — the trailing text
   * action. Figma's placeholder is "CTA Text"; this defaults to the word the
   * variant actually carries in the file.
   */
  rightCTA?: string;
  onRightCTAClick?: () => void;
  /**
   * Keeps the rightCTA's box in the header — invisible and out of the tab
   * order — instead of removing it. `leftAndRightButton`'s Slot is
   * `flex: 1`, so dropping the button by switching to `leftIconButtonOnly`
   * lets the Slot (and whatever fills it, e.g. a progressIndicator) grow into
   * the freed space; on a screen where the same header alternates between
   * offering skip and not, that reads as the bar shifting. Same idiom as
   * `VoiceTurn`'s "reserved" type-instead button: `visibility: hidden` holds
   * the layout, so the width stays constant either way.
   */
  rightCTAHidden?: boolean;
} & Omit<HTMLAttributes<HTMLElement>, 'children'>;

/**
 * Top nav bar shell, 6 icon/button layout variants, content Slot.
 *
 * USE: (unverified) top navigation, variant chosen by how many header actions
 * the screen needs.
 *
 * DON'T: (unverified) don't mismatch Slot content to the chosen variant's
 * icon/button layout.
 */
export function AppBar({
  variant = 'default',
  children,
  leftIcon,
  leftLabel = 'Back',
  onLeftClick,
  rightIcon,
  rightLabel,
  secondRightIcon,
  secondRightLabel = 'More options',
  onRightClick,
  onSecondRightClick,
  rightCTA = 'Skip',
  onRightCTAClick,
  rightCTAHidden = false,
  className,
  ...rest
}: AppBarProps) {
  const classes = [styles.appBar, VARIANT_CLASS[variant], className]
    .filter(Boolean)
    .join(' ');

  const rightCTAButton = HAS_RIGHT_CTA[variant] ? (
    <button
      type="button"
      className={[
        buttonStyles.button,
        buttonStyles.variantTertiary,
        styles.textButton,
        rightCTAHidden ? styles.rightCTAReserved : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onRightCTAClick}
    >
      {rightCTA}
    </button>
  ) : null;

  // In the two-icon variant Figma leads with share; everywhere else the single
  // trailing icon is the overflow menu.
  const twoIcons = variant === 'leftAndTwoRightIconButtons';
  const resolvedRightIcon = rightIcon ?? (twoIcons ? <ShareIcon /> : <MoreVertIcon />);
  const resolvedRightLabel = rightLabel ?? (twoIcons ? 'Share' : 'More options');

  const iconButtonClasses = [
    buttonStyles.button,
    buttonStyles.variantTertiary,
    styles.iconButton,
  ].join(' ');

  const rightIcons = (
    <>
      {HAS_RIGHT_ICON[variant] ? (
        <button
          type="button"
          className={iconButtonClasses}
          aria-label={resolvedRightLabel}
          onClick={onRightClick}
        >
          <span className={styles.glyph}>{resolvedRightIcon}</span>
        </button>
      ) : null}
      {HAS_SECOND_RIGHT_ICON[variant] ? (
        <button
          type="button"
          className={iconButtonClasses}
          aria-label={secondRightLabel}
          onClick={onSecondRightClick}
        >
          <span className={styles.glyph}>{secondRightIcon ?? <MoreVertIcon />}</span>
        </button>
      ) : null}
    </>
  );

  return (
    <header className={classes} {...rest}>
      {HAS_LEFT[variant] ? (
        <button
          type="button"
          className={iconButtonClasses}
          aria-label={leftLabel}
          onClick={onLeftClick}
        >
          <span className={styles.glyph}>{leftIcon ?? <ArrowBackIcon />}</span>
        </button>
      ) : null}

      {/* Figma's Slot. Empty by default, and hidden from the layout when
          nothing is passed, so the actions keep their own spacing. */}
      <div className={styles.slot}>{children}</div>

      {/* Figma groups the trailing actions in their own frame once there are
          two of them. */}
      {HAS_SECOND_RIGHT_ICON[variant] || (HAS_RIGHT_ICON[variant] && HAS_RIGHT_CTA[variant]) ? (
        <div className={styles.rightGroup}>
          {rightIcons}
          {rightCTAButton}
        </div>
      ) : (
        <>
          {rightIcons}
          {rightCTAButton}
        </>
      )}
    </header>
  );
}
