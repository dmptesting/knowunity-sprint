'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';
import { LoadingIcon, SquareIcon } from './icons';

/** Figma variant property `variant`. */
export type ButtonVariant = 'Primary' | 'Secondary' | 'Tertiary';
/** Figma variant property `size`. */
export type ButtonSize = 'S' | 'M' | 'L';
/** Figma variant property `state`. */
export type ButtonState = 'Default' | 'Pressed' | 'Disabled' | 'Loading';

/**
 * Icon box per size, from the iconSlot instances nested in each Figma variant:
 * S -> Icon/200, M -> Icon/250, L -> Icon/300.
 */
const ICON_SIZE: Record<ButtonSize, string> = {
  S: 'var(--dimension-icon-200)',
  M: 'var(--dimension-icon-250)',
  L: 'var(--dimension-icon-300)',
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  Primary: styles.variantPrimary,
  Secondary: styles.variantSecondary,
  Tertiary: styles.variantTertiary,
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  S: styles.sizeS,
  M: styles.sizeM,
  L: styles.sizeL,
};

const STATE_CLASS: Record<ButtonState, string | undefined> = {
  Default: undefined,
  Pressed: styles.statePressed,
  Disabled: styles.stateDisabled,
  Loading: styles.stateLoading,
};

export type ButtonProps = {
  /** Figma variant `variant`. */
  variant?: ButtonVariant;
  /** Figma variant `size`. */
  size?: ButtonSize;
  /** Figma variant `state`. Disabled and Loading also block the click. */
  state?: ButtonState;
  /** Figma property `CTA` — the label. One or two words, sentence case. */
  CTA?: string;
  /** Figma property `showLeftIcon`. */
  showLeftIcon?: boolean;
  /** Figma property `showRightIcon`. */
  showRightIcon?: boolean;
  /** Fills the left iconSlot. Falls back to Figma's `square` placeholder. */
  leftIcon?: ReactNode;
  /** Fills the right iconSlot. Falls back to Figma's `square` placeholder. */
  rightIcon?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

/**
 * Primary/Secondary/Tertiary CTA button, 3 sizes, 4 states.
 *
 * USE: single primary or secondary action, 1-2 word label (default placeholder
 * is literally "1/2 words"). Real usage is almost entirely Primary/L labeled
 * "Check."
 *
 * DON'T: no sentence-length labels. Disabled and Loading states are
 * unverified, no real instance found in either state.
 */
export function Button({
  variant = 'Primary',
  size = 'S',
  state = 'Default',
  CTA = '1/2 words',
  showLeftIcon = false,
  showRightIcon = false,
  leftIcon,
  rightIcon,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isLoading = state === 'Loading';
  const isDisabled = state === 'Disabled';
  const iconSize = ICON_SIZE[size];

  const classes = [
    styles.button,
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    STATE_CLASS[state],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? (
        <>
          <span className={styles.spinner}>
            <LoadingIcon size={iconSize} />
          </span>
          {/* Label is hidden in Figma's Loading variant; kept in the
              accessibility tree so the button keeps its name. */}
          <span className={styles.visuallyHidden}>{CTA}</span>
        </>
      ) : (
        <>
          {showLeftIcon ? (
            <span className={styles.icon}>
              {leftIcon ?? <SquareIcon size={iconSize} />}
            </span>
          ) : null}
          <span className={styles.label}>{CTA}</span>
          {showRightIcon ? (
            <span className={styles.icon}>
              {rightIcon ?? <SquareIcon size={iconSize} />}
            </span>
          ) : null}
        </>
      )}
    </button>
  );
}
