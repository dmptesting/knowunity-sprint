import type { HTMLAttributes } from 'react';
import styles from './MascotSlot.module.css';

/** Figma variant property `size`. */
export type MascotSlotSize = 'XL' | '2XL' | '3XL' | '4XL';

/**
 * The expressions shipped in `public/images/`. Figma exposes the same choice as
 * an INSTANCE_SWAP property named `Homie`, with 16 preferred values.
 *
 * Only `standby` has real shipped usage — design-system.md is explicit that
 * every other state is unverified, so treat the rest as available but unproven.
 */
export type MascotExpression =
  | 'standby'
  | 'amazed'
  | 'angry'
  | 'approving'
  | 'confused'
  | 'dazed'
  | 'determined'
  | 'excited'
  | 'giggling'
  | 'laughing'
  | 'overIt'
  | 'questioning'
  | 'sad'
  | 'thinking';

const SIZE_CLASS: Record<MascotSlotSize, string> = {
  XL: styles.sizeXl,
  '2XL': styles.size2xl,
  '3XL': styles.size3xl,
  '4XL': styles.size4xl,
};

export type MascotSlotProps = {
  /** Figma variant `size`. Real usage favours 2XL/3XL; XL never appears. */
  size?: MascotSlotSize;
  /**
   * Which expression to draw. Figma's INSTANCE_SWAP property is named `Homie`;
   * this is the same choice by a name that says what it selects. Only
   * `standby` is verified in real use.
   */
  expression?: MascotExpression;
  /**
   * Accessible name. Knowie is decorative wherever a calloutBubble or heading
   * already carries the words, which is every screen in the recall loop — so
   * this defaults to decorative. Pass it only when the mascot is the only
   * thing conveying something.
   */
  label?: string;
} & Omit<HTMLAttributes<HTMLSpanElement>, 'children'>;

/**
 * Knowie mascot at one of 4 sizes, wraps a nested "standby" instance.
 *
 * USE: mascot moments sized to context. Real usage favors 2XL/3XL, XL never
 * appears.
 *
 * DON'T: other mascot states beyond "standby" may be swappable via the nested
 * structure, but that's unverified, only "standby" was found in real use.
 */
export function MascotSlot({
  size = 'XL',
  expression = 'standby',
  label,
  className,
  ...rest
}: MascotSlotProps) {
  const classes = [styles.mascotSlot, SIZE_CLASS[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...rest}>
      {/* Figma's ".mascotSlotBase": a Space/300 inset on all four sides, with
          the mascot filling what's left. */}
      <span className={styles.base}>
        {/* Served from public/, which Next and Storybook both expose at the
            site root — so the 275KB artwork never enters the bundle.

            A plain <img> on purpose: next/image's optimizer does nothing for
            SVG (it needs `dangerouslyAllowSVG` to serve it at all, and then
            passes it through untouched), and Knowie's box is fixed by a
            token, so there is no layout shift to protect against. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.art}
          src={`/images/${expression}.svg`}
          alt={label ?? ''}
          aria-hidden={label ? undefined : true}
          draggable={false}
        />
      </span>
    </span>
  );
}
