'use client';

import { Screen } from '../../_components/screen/Screen';
import { AppBar } from '../../_components/appBar/AppBar';
import { Button } from '../../_components/button/Button';
import { CloseIcon } from '../../_components/icons/UiIcons';
import { Spotlight } from '../../_components/spotlight/Spotlight';
import styles from './HintOverlay.module.css';

export type HintOverlayProps = {
  /** The hint itself. The only thing on the screen, so it is sized to be. */
  body: string;
  /**
   * The eyebrow. "Hint 1" or "Hint 2", matching the chip that opened it, so
   * the student can tell which tier they are reading.
   */
  label?: string;
  /**
   * Back to the question. Both the close button and "try again" call it —
   * there is one way out of a hint and it is forward.
   */
  onDismiss?: () => void;
};

/**
 * The hint, given the whole screen.
 *
 * It replaces the turn rather than floating over it. Visually that is the
 * overlay it was asked to be — it covers everything — but with nothing behind
 * it there is no focus to trap and no inert background to manage, which is a
 * great deal more robust than a true modal for the same result.
 *
 * **Dismissing does not lose the hint.** It stays reachable from the turn
 * underneath as a chip under Knowie's question — "Hint 1", "Hint 2" — that
 * reopens this overlay. One tap away rather than on screen: a deliberate move
 * off SPEC.md:303, "the hint stays visible on screen while re-recording", for
 * a cleaner turn.
 *
 * Viewing a hint routes straight back into a re-attempt — it never
 * auto-reveals and never auto-advances (sprint-context.md).
 */
export function HintOverlay({ body, label = 'Hint', onDismiss }: HintOverlayProps) {
  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="hint-overlay-label"
      onKeyDown={(event) => {
        if (event.key === 'Escape') onDismiss?.();
      }}
    >
      <Screen
        top={
          <AppBar
            variant="leftIconButtonOnly"
            leftIcon={<CloseIcon />}
            leftLabel="Close hint"
            onLeftClick={onDismiss}
          />
        }
        bottom={
          <Button variant="Primary" size="L" CTA="Try again" onClick={onDismiss} />
        }
      >
        {/*
          The hint and its label, "Hint 1" or "Hint 2", both at Headline S —
          the label in brand colour, so the student can see at a glance which
          tier they are reading.
          focusOnMount because the screen changed under the student without
          their focus moving.
        */}
        <Spotlight
          label={label}
          labelId="hint-overlay-label"
          body={body}
          labelSize="L"
          size="S"
          focusOnMount
        />
      </Screen>
    </div>
  );
}
