import type { HTMLAttributes } from 'react';
import styles from './TextBlock.module.css';

/** Figma variant property `variant` — the size step, XL down to S. */
export type TextBlockVariant = 'XL' | 'L' | 'M' | 'S';

const VARIANT_CLASS: Record<TextBlockVariant, string> = {
  XL: styles.variantXl,
  L: styles.variantL,
  M: styles.variantM,
  S: styles.variantS,
};

export type TextBlockProps = {
  /** Figma variant `variant`. Figma's own default is XL. */
  variant?: TextBlockVariant;
  /**
   * Figma property `title`. The block's own copy — the larger, higher-contrast
   * half of the pairing, whatever it holds. Figma's placeholder is "Header";
   * this has no default, so the block can never ship placeholder copy.
   */
  title: string;
  /**
   * Figma property `caption`. The supporting line beneath the title, at
   * text/secondary. Required whenever `showCaption` is on.
   */
  caption?: string;
  /**
   * Figma property `showCaption`. On in the file's default. Turn it off for a
   * block that is a single run of copy with nothing to qualify it.
   */
  showCaption?: boolean;
} & Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'>;

/**
 * A title paired with an optional caption, at four size steps.
 *
 * USE: (unverified) body copy on a screen that needs a real text style rather
 * than a card — an answer, a transcript, an explanation.
 *
 * DON'T: (unverified) don't put the screen's payload in `caption`. It is
 * Caption M/S Regular at text/secondary, sized to qualify the title, not to
 * carry the thing the student came to read.
 *
 * design-system.md is explicit that textBlock has zero real instances anywhere
 * in the example screens, so the variant grid is structure, not proof. Check
 * the result on the screen rather than trusting the grid.
 */
export function TextBlock({
  variant = 'XL',
  title,
  caption,
  showCaption = true,
  className,
  ...rest
}: TextBlockProps) {
  const classes = [styles.textBlock, VARIANT_CLASS[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {/* Figma's layer names: "Header", then "Caption". */}
      <p className={styles.title}>{title}</p>
      {showCaption && caption ? <p className={styles.caption}>{caption}</p> : null}
    </div>
  );
}
