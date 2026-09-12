'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import buttonStyles from '../button/Button.module.css';
import styles from './ButtonIcon.module.css';
import { LoadingIcon, SquareIcon } from '../button/icons';

/** Figma variant property `variant`. */
export type ButtonIconVariant = 'Primary' | 'Secondary' | 'Tertiary';
/** Figma variant property `size`. */
export type ButtonIconSize = 'S' | 'M' | 'L';
/** Figma variant property `state`. */
export type ButtonIconState = 'Default' | 'Pressed' | 'Disabled' | 'Loading';

/**
 * Icon box per size, from the iconSlot instances nested in each Figma variant:
 * S -> Icon/200, M -> Icon/250, L -> Icon/300. Same mapping the button uses.
 */
const ICON_SIZE: Record<ButtonIconSize, string> = {
  S: 'var(--dimension-icon-200)',
  M: 'var(--dimension-icon-250)',
  L: 'var(--dimension-icon-300)',
};

/* Emphasis and state come from the button's own stylesheet — buttonIcon is
   "the icon-only twin of button, same variant/size/state grid", so the fills,
   press overlays and disabled treatment are literally the same rules. */
const VARIANT_CLASS: Record<ButtonIconVariant, string> = {
  Primary: buttonStyles.variantPrimary,
  Secondary: buttonStyles.variantSecondary,
  Tertiary: buttonStyles.variantTertiary,
};

const STATE_CLASS: Record<ButtonIconState, string | undefined> = {
  Default: undefined,
  Pressed: buttonStyles.statePressed,
  Disabled: buttonStyles.stateDisabled,
  Loading: buttonStyles.stateLoading,
};

const SIZE_CLASS: Record<ButtonIconSize, string> = {
  S: styles.sizeS,
  M: styles.sizeM,
  L: styles.sizeL,
};

export type ButtonIconProps = {
  /** Figma variant `variant`. Real usage is 100% Secondary. */
  variant?: ButtonIconVariant;
  /** Figma variant `size`. Real usage is never S. */
  size?: ButtonIconSize;
  /** Figma variant `state`. Disabled and Loading also block the click. */
  state?: ButtonIconState;
  /** Fills the iconSlot. Falls back to Figma's `square` placeholder. */
  icon?: ReactNode;
  /**
   * The button's accessible name, e.g. "Close". Required: an icon-only button
   * has no visible text to name it. Figma has no property for this — the stray
   * hidden "Button" text node in some variants is leftover, not content.
   */
  label: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

/**
 * Icon-only twin of button, same variant/size/state grid, no label frame.
 *
 * USE: icon-only actions. Real usage is 100% Secondary, never Primary or size S.
 *
 * DON'T: don't expect visible text; a stray "Button" text node found nested in
 * some real instances is very likely an unused leftover, not real content.
 */
export function ButtonIcon({
  variant = 'Primary',
  size = 'S',
  state = 'Default',
  icon,
  label,
  className,
  type = 'button',
  ...rest
}: ButtonIconProps) {
  const isLoading = state === 'Loading';
  const isDisabled = state === 'Disabled';
  const iconSize = ICON_SIZE[size];

  const classes = [
    buttonStyles.button,
    styles.buttonIcon,
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    STATE_CLASS[state],
    // Figma gives only the Primary variant a 1px border/default edge.
    variant === 'Primary' ? styles.primaryEdge : null,
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
      aria-label={label}
      {...rest}
    >
      {isLoading ? (
        <span className={buttonStyles.spinner}>
          <LoadingIcon size={iconSize} />
        </span>
      ) : (
        <span className={styles.icon}>{icon ?? <SquareIcon size={iconSize} />}</span>
      )}
    </button>
  );
}
