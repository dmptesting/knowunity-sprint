'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import styles from './ButtonGroup.module.css';
import { Button } from '../button/Button';
import { ButtonIcon } from '../buttonIcon/ButtonIcon';

/** Figma variant property `variant` — the axis is direction, not emphasis. */
export type ButtonGroupVariant = 'Horizontal' | 'Vertical';
/** Figma variant property `size`. Passed straight through to both buttons. */
export type ButtonGroupSize = 'M' | 'L';

const VARIANT_CLASS: Record<ButtonGroupVariant, string> = {
  Horizontal: styles.horizontal,
  Vertical: styles.vertical,
};

export type ButtonGroupProps = {
  /** Figma variant `variant`. Real usage is 100% Horizontal. */
  variant?: ButtonGroupVariant;
  /** Figma variant `size`. Real usage is 100% size L. */
  size?: ButtonGroupSize;
  /** Label of the Primary button. Figma's nested placeholder is "1/2 words". */
  primaryCTA: string;
  /** Label of the Secondary button. `Vertical` only. */
  secondaryCTA?: string;
  /** Icon for the Secondary buttonIcon. `Horizontal` only. */
  secondaryIcon?: ReactNode;
  /** Accessible name for the Secondary buttonIcon. `Horizontal` only. */
  secondaryLabel?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

/**
 * Wrapper pairing two button instances (Primary + Secondary by default).
 *
 * USE: a primary + secondary action pair. Real usage is 100% Horizontal/size L.
 *
 * DON'T: adding a third button is unverified, not confirmed as enforced, just
 * not seen.
 *
 * `Vertical` stacks a Primary over a Secondary button. `Horizontal` pairs a
 * Secondary buttonIcon with a Primary button that takes the remaining width,
 * which is how Figma builds that variant.
 */
export function ButtonGroup({
  variant = 'Vertical',
  size = 'M',
  primaryCTA,
  secondaryCTA,
  secondaryIcon,
  secondaryLabel,
  onPrimaryClick,
  onSecondaryClick,
  className,
  ...rest
}: ButtonGroupProps) {
  const classes = [styles.buttonGroup, VARIANT_CLASS[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {/* Horizontal leads with the icon-only secondary action, exactly as the
          Figma variant is built. */}
      {variant === 'Horizontal' ? (
        <ButtonIcon
          variant="Secondary"
          size={size}
          icon={secondaryIcon}
          label={secondaryLabel ?? 'Secondary action'}
          onClick={onSecondaryClick}
        />
      ) : null}

      <Button
        variant="Primary"
        size={size}
        CTA={primaryCTA}
        className={styles.primary}
        onClick={onPrimaryClick}
      />

      {variant === 'Vertical' ? (
        <Button
          variant="Secondary"
          size={size}
          CTA={secondaryCTA ?? '1/2 words'}
          className={styles.secondary}
          onClick={onSecondaryClick}
        />
      ) : null}
    </div>
  );
}
