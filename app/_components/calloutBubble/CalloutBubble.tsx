import type { HTMLAttributes } from 'react';
import styles from './CalloutBubble.module.css';

export type CalloutBubbleProps = {
  /**
   * The copy Knowie is "saying". Figma's Body text is a plain text layer rather
   * than an exposed component property, so this has no Figma name to match and
   * no default — the bubble should never render placeholder copy.
   */
  body: string;
  /**
   * Whether to draw the tail. On by default, as Figma ships it. The tail is
   * fixed pointing left, so turn it off wherever Knowie is not directly to the
   * bubble's left — above it, for one — or it points at nothing. Not a Figma
   * property yet.
   */
  showTail?: boolean;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

/**
 * Knowie's speech bubble, used to present the mascot's spoken prompt or
 * question as on-screen text.
 *
 * Reach for it anywhere the mascot is "talking," most often the recall question
 * itself.
 *
 * Don't widen the Bubble past its fixed 342px body; long copy should wrap to a
 * second line, not stretch the bubble out.
 *
 * "Talking" is on-screen text only: Knowie never gets a voice (CLAUDE.md).
 */
export function CalloutBubble({
  body,
  showTail = true,
  className,
  ...rest
}: CalloutBubbleProps) {
  const classes = [styles.calloutBubble, className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {/* Figma's "Tail": a rotated polygon, decorative — the bubble's meaning
          is entirely in its copy. */}
      {showTail ? <span className={styles.tail} aria-hidden="true" /> : null}
      <div className={showTail ? styles.bubble : `${styles.bubble} ${styles.bubbleNoTail}`}>
        <p className={styles.body}>{body}</p>
      </div>
    </div>
  );
}
