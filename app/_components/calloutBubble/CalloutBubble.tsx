import type { HTMLAttributes } from 'react';
import styles from './CalloutBubble.module.css';

export type CalloutBubbleProps = {
  /**
   * The copy Knowie is "saying". Figma's Body text is a plain text layer rather
   * than an exposed component property, so this has no Figma name to match and
   * no default — the bubble should never render placeholder copy.
   */
  body: string;
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
export function CalloutBubble({ body, className, ...rest }: CalloutBubbleProps) {
  const classes = [styles.calloutBubble, className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {/* Figma's "Tail": a rotated polygon, decorative — the bubble's meaning
          is entirely in its copy. */}
      <span className={styles.tail} aria-hidden="true" />
      <div className={styles.bubble}>
        <p className={styles.body}>{body}</p>
      </div>
    </div>
  );
}
