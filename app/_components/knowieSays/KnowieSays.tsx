import type { HTMLAttributes, ReactNode } from 'react';
import styles from './KnowieSays.module.css';
import { CalloutBubble } from '../calloutBubble/CalloutBubble';
import { MascotSlot, type MascotExpression } from '../mascotSlot/MascotSlot';

export type KnowieSaysProps = {
  /** The line Knowie is "saying". On-screen text only — he never gets audio. */
  body: string;
  /**
   * Which expression to draw. `standby` is the only one with real shipped
   * usage; SPEC.md assigns the rest per state — `thinking` on reveal,
   * `approving` on a pass.
   */
  expression?: MascotExpression;
  /**
   * Anything that belongs to what Knowie just said — the spent-hint chips, for
   * one. Rendered in its own row beneath the bubble and aligned to the bubble's
   * left edge, so it reads as attached to his line rather than floating free.
   */
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

/**
 * Knowie beside his own speech bubble.
 *
 * USE: (unverified) anywhere in the recall loop where Knowie says something —
 * the question on a turn, his line on the reveal, his line on the denied
 * screen.
 *
 * DON'T: (unverified) don't put the student's words in it. The bubble is
 * Knowie's, and a transcript belongs in a `textBlock`.
 *
 * Mascot on the **left**, bubble on the right, because `calloutBubble`'s tail
 * is fixed pointing left — this is the one arrangement where it points at
 * anything. Screen 03 is the only real frame pairing the two and draws it this
 * way; `MascotSlot`'s own "Above a calloutBubble" story records the stacked
 * alternative as an open question precisely because the tail then points at
 * nothing.
 *
 * Fixed at `2XL`. All four screens that pair the two use that size, and
 * `MascotSlot` has no size that reads well beside a bubble at 390px — `3XL` is
 * 200px and leaves the bubble 150. The primer stacks a `3XL` above its copy
 * instead, which is a different composition, not this one.
 */
export function KnowieSays({
  body,
  expression = 'standby',
  children,
  className,
  ...rest
}: KnowieSaysProps) {
  const classes = [styles.knowieSays, className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {/*
        The mascot and the bubble keep their own row, centred on each other
        exactly as before. The attachment row goes underneath rather than into
        the same flex line, so adding it never moves Knowie.
      */}
      <div className={styles.row}>
        <MascotSlot size="2XL" expression={expression} />
        <CalloutBubble body={body} />
      </div>
      {children ? <div className={styles.attachment}>{children}</div> : null}
    </div>
  );
}
