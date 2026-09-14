'use client';

import { useCallback, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from 'react';

/**
 * Where a take is in its lifecycle.
 *
 * - `idle` — nothing is being captured.
 * - `holding` — capturing; releasing here sends.
 * - `armed` — capturing, but the pointer has slid off the control; releasing
 *   here discards instead.
 */
export type PushToTalkPhase = 'idle' | 'holding' | 'armed';

export type UsePushToTalkOptions = {
  /** Release inside the control, or the second tap in tap mode. */
  onSend?: () => void;
  /** Release while armed, the tap-mode cancel, or a pointer the OS took away. */
  onCancel?: () => void;
  /**
   * Tap to start, tap to send, instead of holding. The manual alternative the
   * primer introduces, for anyone who can't sustain a press.
   */
  tapMode?: boolean;
  /** Blocks the control — while an answer is being judged, for instance. */
  disabled?: boolean;
};

/**
 * Push-to-talk: hold to speak, release to send, slide away to cancel.
 *
 * **Nothing here detects when speech stops.** There is no timer, no silence
 * threshold and no endpointing of any kind: a take ends when the student ends
 * it, and only then. Holding in silence for a minute submits nothing. That is
 * the brief's constraint and the Voice UX Reference's second principle — the
 * commonest voice failure is the system guessing wrong about when someone is
 * still talking, and push-to-talk removes the guess rather than tuning it.
 *
 * Cancel arms in **any** direction off the control, not one fixed axis, so a
 * student who fumbles does not also have to remember which way to go.
 *
 * Three routes reach the same machine:
 *
 * - **Pointer, hold mode.** Down starts, move arms or disarms, up sends or
 *   discards.
 * - **Pointer, tap mode.** One tap starts, the next sends. Set from the
 *   primer's toggle.
 * - **Keyboard and assistive tech.** A click with no pointer behind it
 *   (`detail === 0`, which is what Enter, Space and a screen reader's activate
 *   gesture produce) always behaves as tap mode, whatever the toggle says.
 *   Nobody should have to hold a key down to be heard.
 */
export function usePushToTalk({
  onSend,
  onCancel,
  tapMode = false,
  disabled = false,
}: UsePushToTalkOptions = {}) {
  const [phase, setPhase] = useState<PushToTalkPhase>('idle');

  // Set when a take was started by keyboard or assistive tech, so its second
  // activation sends even if the toggle is off.
  const tapStarted = useRef(false);

  const finish = useCallback(
    (outcome: 'send' | 'cancel') => {
      tapStarted.current = false;
      setPhase('idle');
      if (outcome === 'send') onSend?.();
      else onCancel?.();
    },
    [onSend, onCancel],
  );

  const toggleTap = useCallback(() => {
    if (phase === 'idle') {
      tapStarted.current = true;
      setPhase('holding');
    } else {
      finish('send');
    }
  }, [phase, finish]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (disabled) return;

      if (tapMode) {
        toggleTap();
        return;
      }

      setPhase('holding');

      // Keeps move and up events coming even once the pointer has left the
      // control, which is the whole point of sliding away to cancel.
      //
      // Capture is an optimisation, not the mechanism: it throws NotFoundError
      // for a pointer id the browser has no active pointer for, which is what
      // synthetic events in tests produce. The phase is set first and the
      // throw swallowed, so a failed capture costs the arming precision on the
      // way out of the circle and nothing else.
      try {
        event.currentTarget.setPointerCapture?.(event.pointerId);
      } catch {
        /* no capture available; move events still arrive while over the control */
      }
    },
    [disabled, tapMode, toggleTap],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (tapMode || phase === 'idle') return;

      // Armed once the pointer is outside the painted circle, measured from its
      // centre so every direction behaves the same.
      const box = event.currentTarget.getBoundingClientRect();
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);
      const radius = Math.min(box.width, box.height) / 2;

      setPhase(Math.hypot(dx, dy) > radius ? 'armed' : 'holding');
    },
    [tapMode, phase],
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (tapMode || phase === 'idle') return;
      try {
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      } catch {
        /* nothing was captured — see onPointerDown */
      }
      finish(phase === 'armed' ? 'cancel' : 'send');
    },
    [tapMode, phase, finish],
  );

  /**
   * The OS took the pointer away — a call arrived, a system gesture won. The
   * take is discarded rather than sent: submitting something the student never
   * chose to submit is the worse failure.
   */
  const onPointerCancel = useCallback(() => {
    if (tapMode || phase === 'idle') return;
    finish('cancel');
  }, [tapMode, phase, finish]);

  /**
   * Keyboard and assistive tech. A real pointer click reports `detail >= 1`
   * and is already handled above, so only synthetic activations get here.
   */
  const onClick = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      if (disabled || event.detail !== 0) return;
      if (phase === 'idle' || tapStarted.current) toggleTap();
    },
    [disabled, phase, toggleTap],
  );

  /** Discards the current take from outside the control — tap mode's cancel. */
  const cancel = useCallback(() => {
    if (phase !== 'idle') finish('cancel');
  }, [phase, finish]);

  return {
    phase,
    cancel,
    /** Spread onto the element that draws the circle. */
    controlProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onClick,
    },
  };
}
