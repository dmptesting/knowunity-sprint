'use client';

import { Screen } from '../../_components/screen/Screen';
import { KnowieSays } from '../../_components/knowieSays/KnowieSays';
import { AppBar } from '../../_components/appBar/AppBar';
import { Button } from '../../_components/button/Button';
import { HintChips } from '../../_components/hintChips/HintChips';
import {
  ProgressIndicator,
  type ProgressIndicatorProgress,
} from '../../_components/progressIndicator/ProgressIndicator';
import { StatusNotice } from '../../_components/statusNotice/StatusNotice';
import { VoiceCircle } from '../../_components/voiceCircle/VoiceCircle';
import { CloseIcon } from '../../_components/icons/UiIcons';
import { usePushToTalk, type PushToTalkPhase } from '../../_recall/usePushToTalk';
import { NOTICES, type NoticeKind } from '../../_recall/notices';
import styles from './VoiceTurn.module.css';

/**
 * The hint line above the circle, which is how slide-to-cancel is taught —
 * there is no other affordance for it, so the copy has to carry it.
 */
const HOLD_HINTS: Record<PushToTalkPhase, string> = {
  idle: 'Hold to speak',
  holding: 'Release to send · slide away to cancel',
  armed: 'Release to cancel',
};

/** Tap mode has no slide gesture, so it gets its own, shorter ladder. */
const TAP_HINTS: Record<PushToTalkPhase, string> = {
  idle: 'Tap to start',
  holding: 'Tap to send',
  armed: 'Tap to send',
};

export type VoiceTurnProps = {
  /** The question, spoken by Knowie. */
  question: string;
  /** Where the session is. Does not move on a re-attempt. */
  progress?: ProgressIndicatorProgress;
  /** The answer is away and being judged. Blocks the control. */
  processing?: boolean;
  /**
   * Every hint spent on this question, in order. Each shows as a chip under
   * Knowie's question — "Hint 1", "Hint 2" — that reopens it.
   */
  hints?: readonly string[];
  /** Reopen a spent hint, by its position in `hints`. */
  onOpenHint?: (index: number) => void;
  /** Which status notice to show, if any. Replaces the hint line. */
  notice?: NoticeKind;
  /** Tap to start and stop, instead of holding. Set from the primer's toggle. */
  tapMode?: boolean;
  /**
   * Forces a phase, for review and stories. The session leaves it undefined
   * and lets the gesture drive it.
   */
  phase?: PushToTalkPhase;
  /**
   * A result sheet is over the lower screen. The question and its controls are
   * locked; the header stays live so close and skip still work.
   */
  locked?: boolean;
  /**
   * Whether skip is offered. Off while a correct result sheet is up: the
   * question is already answered, so there is nothing left to skip and "next
   * question" is the one way on. Close stays either way.
   */
  canSkip?: boolean;
  onClose?: () => void;
  /** Straight to the next question. No answer shown, no XP. */
  onSkip?: () => void;
  /** Switch to the text path for the rest of the session. */
  onTypeInstead?: () => void;
  /** An explicit release or tap — never a silence timer. */
  onSend?: () => void;
  /** The take was discarded, not sent. */
  onCancel?: () => void;
  /** Re-attempt after a notice. Free: the ladder is not charged. */
  onRetry?: () => void;
};

/**
 * The voice turn: idle, recording, armed-to-cancel, processing, and the four
 * status notices.
 *
 * **Skip lives in the header**, as `AppBar`'s `rightCTA`, matching the
 * library's documented recall header — not under the circle, which leaves
 * "type instead" as the only action down there.
 *
 * **Nothing detects when the student stops talking.** Holding in silence for a
 * minute submits nothing; the take ends when they end it.
 */
export function VoiceTurn({
  question,
  progress = '0',
  processing = false,
  hints = [],
  onOpenHint,
  notice,
  tapMode = false,
  phase: forcedPhase,
  locked = false,
  canSkip = true,
  onClose,
  onSkip,
  onTypeInstead,
  onSend,
  onCancel,
  onRetry,
}: VoiceTurnProps) {
  const pushToTalk = usePushToTalk({
    onSend,
    onCancel,
    tapMode,
    disabled: processing || notice !== undefined,
  });

  const phase = forcedPhase ?? pushToTalk.phase;
  const recording = phase !== 'idle';
  const hintLines = tapMode ? TAP_HINTS : HOLD_HINTS;

  // Figma 03 shows the escape under the circle; 04 and 05 drop it. Mid-take and
  // mid-judgement there is nothing to escape to yet — the way out is to finish
  // or discard the take, and both are one gesture away.
  //
  // It stays up during a notice, though. "I didn't catch anything" twice in a
  // row is exactly the moment a student wants to stop fighting the microphone,
  // and the notice's own retry is not a way out of voice.
  const showTypeInstead = !recording && !processing;

  return (
    <Screen
      lockBody={locked}
      top={
        <AppBar
          /*
           * Always the same variant, so the header's width never changes.
           * Switching to `leftIconButtonOnly` when skip isn't offered let the
           * Slot's `flex: 1` grow into the freed space, which shifted
           * progressIndicator inside it — the bar looked like it jumped
           * between a correct answer's sheet (skip gone) and the next
           * question (skip back). `rightCTAHidden` keeps the button's box in
           * place and only hides it.
           */
          variant="leftAndRightButton"
          leftIcon={<CloseIcon />}
          leftLabel="Close"
          rightCTA="Skip"
          rightCTAHidden={!canSkip}
          onLeftClick={onClose}
          onRightCTAClick={onSkip}
        >
          <ProgressIndicator
            variant="Primary"
            thickness="16"
            progress={progress}
            aria-label="Recall progress"
          />
        </AppBar>
      }
      /*
       * Frame 03 pins "Type instead" near the foot of the screen rather than
       * tucking it under the circle — which it has to, because voiceCircle's
       * halo paints 320px out of a 200px box and would swallow anything
       * closer.
       */
      bottom={
        tapMode && recording ? (
          /*
           * Tap mode has no slide gesture, so it needs a visible way to
           * discard a take. Without this, turning the toggle on would cost the
           * student the cancel that hold users get for free.
           */
          <Button
            variant="Secondary"
            size="M"
            CTA="Cancel"
            onClick={pushToTalk.cancel}
          />
        ) : (
          /*
           * Always rendered, hidden rather than removed while a take is
           * running. Frames 04 and 05 drop the escape mid-take — but dropping
           * the element collapsed the whole action row, and the content region
           * above it is centred, so the circle jumped 26px down the moment the
           * student pressed it. The circle must not move under a finger that
           * is holding it.
           *
           * `visibility: hidden` keeps the box and takes the button out of the
           * tab order and the accessibility tree, so it is gone in every sense
           * except the one that matters here.
           */
          <Button
            className={`${styles.typeInstead} ${showTypeInstead ? '' : styles.reserved}`}
            variant="Tertiary"
            size="M"
            CTA="Type instead"
            onClick={onTypeInstead}
          />
        )
      }
    >
      <div className={styles.content}>
        <KnowieSays className={styles.knowie} body={question}>
          {hints.length > 0 ? (
            <HintChips hints={hints} onOpen={onOpenHint} />
          ) : null}
        </KnowieSays>

        {/*
          Faded out while a result sheet is up. The sheet covers the lower half
          and the circle is locked anyway, so the halo and "hold to speak"
          peeking out above it read as a half-hidden control. Hidden rather
          than removed, so Knowie and the question above keep their place.
        */}
        <div className={`${styles.stage} ${locked ? styles.stageHidden : ''}`}>
          {notice ? (
            <div className={styles.notice}>
              <StatusNotice
              body={NOTICES[notice].body}
              retryCTA={NOTICES[notice].retryCTA}
              onRetry={onRetry}
            />
            </div>
          ) : (
            /*
             * The hint line. `aria-live` is deliberately off: the phase changes
             * under the student's own finger, and announcing every arm and
             * disarm would talk over them. voiceCircle's own label carries the
             * state for assistive tech.
             */
            <p className={styles.hintLine}>
              {processing ? 'Let me check that…' : hintLines[phase]}
            </p>
          )}

          <button
            type="button"
            className={`${styles.control} ${notice ? styles.unavailable : ''}`}
            // Stops a hold from turning into a text selection or the OS
            // magnifier, which would swallow the gesture on iOS.
            style={{ touchAction: 'none' }}
            disabled={processing || notice !== undefined}
            aria-label={
              phase === 'idle'
                ? tapMode
                  ? 'Tap to start recording'
                  : 'Hold to record your answer'
                : 'Send your answer'
            }
            aria-pressed={recording}
            {...pushToTalk.controlProps}
          >
            <VoiceCircle
              mode={processing ? 'processing' : recording ? 'recording' : 'idle'}
            />
          </button>

        </div>
      </div>
    </Screen>
  );
}
