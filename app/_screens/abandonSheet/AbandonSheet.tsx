'use client';

import { useState } from 'react';
import { ButtonGroup } from '../../_components/buttonGroup/ButtonGroup';
import { CheckboxRow } from '../../_components/checkboxRow/CheckboxRow';
import { ABANDON_REASONS, offersTyping } from '../../_recall/abandonReasons';
import styles from './AbandonSheet.module.css';

export type AbandonSheetProps = {
  /** Which reasons are ticked. Left uncontrolled, the sheet owns them. */
  selected?: readonly string[];
  onSelectedChange?: (selected: string[]) => void;
  /** Dismiss and carry on with the session as it was. */
  onKeepReviewing?: () => void;
  /** Carry on, but in text. Offered instead of "keep reviewing". */
  onSwitchToTyping?: () => void;
  /** Leave the session. Always the secondary, always one tap. */
  onLeave?: () => void;
  /** Tapping the scrim behind the sheet. Same as "keep reviewing". */
  onDismiss?: () => void;
};

/**
 * The abandon sheet, shown when the student closes mid-session.
 *
 * Already shipped in the beta, so cutting it for a prototype would be a
 * regression rather than a scope cut (sprint-context.md).
 *
 * **The primary action adapts; the escape never moves.** Ticking "something
 * didn't work right", "I can't speak out loud right now" or "I'd rather type"
 * says the *voice path* is the problem, not the recall — so the primary
 * becomes "switch to typing" rather than asking them again to do the thing
 * they just said they could not do. "Leave anyway" stays the secondary
 * throughout, so leaving is always one tap and the sheet never becomes a
 * trap.
 *
 * That also keeps the sheet inside `buttonGroup`'s two slots. Adding a third
 * action would mean a component the library does not have.
 */
export function AbandonSheet({
  selected: controlled,
  onSelectedChange,
  onKeepReviewing,
  onSwitchToTyping,
  onLeave,
  onDismiss,
}: AbandonSheetProps) {
  const [internal, setInternal] = useState<string[]>([]);
  const selected = controlled ?? internal;

  const toggle = (id: string, checked: boolean) => {
    const next = checked
      ? [...selected, id]
      : selected.filter((value) => value !== id);
    if (controlled === undefined) setInternal(next);
    onSelectedChange?.(next);
  };

  const typing = offersTyping(selected);

  return (
    <div className={styles.abandonSheet}>
      {/*
        Figma's "Bottom-sheet background": a scrim over everything behind. It
        dismisses on tap, which is what a scrim is for — but it is not the only
        way out, so it carries no accessible name of its own.
      */}
      <div
        className={styles.scrim}
        role="presentation"
        onClick={onDismiss ?? onKeepReviewing}
      />

      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="abandon-sheet-heading"
      >
        {/* Figma's grabber: a 36×4 bar. Decorative — the sheet is dismissed by
            the scrim or the actions, never by dragging this. */}
        <span className={styles.grabber} aria-hidden="true" />

        <h2 id="abandon-sheet-heading" className={styles.heading}>
          What made you stop?
        </h2>

        <div className={styles.reasons}>
          {ABANDON_REASONS.map((reason) => (
            <CheckboxRow
              key={reason.id}
              label={reason.label}
              checked={selected.includes(reason.id)}
              onCheckedChange={(checked) => toggle(reason.id, checked)}
            />
          ))}
        </div>

        <ButtonGroup
          variant="Vertical"
          size="L"
          primaryCTA={typing ? 'Switch to typing' : 'Keep reviewing'}
          secondaryCTA="Leave anyway"
          onPrimaryClick={typing ? onSwitchToTyping : onKeepReviewing}
          onSecondaryClick={onLeave}
        />
      </div>
    </div>
  );
}
