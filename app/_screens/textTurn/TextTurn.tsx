'use client';

import { Screen } from '../../_components/screen/Screen';
import { KnowieSays } from '../../_components/knowieSays/KnowieSays';
import { AppBar } from '../../_components/appBar/AppBar';
import { HintChips } from '../../_components/hintChips/HintChips';
import { ChatInput, type ChatInputStatus } from '../../_components/chatInput/ChatInput';
import {
  ProgressIndicator,
  type ProgressIndicatorProgress,
} from '../../_components/progressIndicator/ProgressIndicator';
import { StatusNotice } from '../../_components/statusNotice/StatusNotice';
import { CloseIcon } from '../../_components/icons/UiIcons';
import { NOTICES, type NoticeKind } from '../../_recall/notices';
import styles from './TextTurn.module.css';

export type TextTurnProps = {
  /** The question, spoken by Knowie. The same one the voice turn asks. */
  question: string;
  /** Which `ChatInput` status the field is in. */
  status?: ChatInputStatus;
  /** What the student has typed. */
  value?: string;
  onChange?: (value: string) => void;
  /** Explicit send. Never automatic. */
  onSend?: () => void;
  /** Back to voice. Present on every text turn, so the switch is reversible. */
  onVoice?: () => void;
  /** Where the session is. Does not move on a re-attempt. */
  progress?: ProgressIndicatorProgress;
  /**
   * Every hint spent on this question, in order. Each shows as a chip under
   * Knowie's question — "Hint 1", "Hint 2" — that reopens it.
   */
  hints?: readonly string[];
  /** Reopen a spent hint, by its position in `hints`. */
  onOpenHint?: (index: number) => void;
  /** Which status notice to show, if any. */
  notice?: NoticeKind;
  onRetry?: () => void;
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
};

/**
 * The text fallback turn.
 *
 * Not a lesser path: a typed answer gets the same verdicts, the same hint
 * ladder and the same XP as a spoken one. Some students cannot speak, and many
 * more cannot speak *right now* — on a bus, in a library, in a shared room.
 *
 * **Text is sticky.** Once the session switches, it stays switched, so nobody
 * has to re-choose it every question. `chatInput`'s own mic button is the way
 * back, present on every turn.
 *
 * Send is always explicit — `chatInput` has no submit-on-blur and no timer.
 */
export function TextTurn({
  question,
  hints = [],
  onOpenHint,
  status = 'Inactive',
  value,
  onChange,
  onSend,
  onVoice,
  progress = '0',
  notice,
  onRetry,
  locked = false,
  canSkip = true,
  onClose,
  onSkip,
}: TextTurnProps) {
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
      bottom={
        <ChatInput
          status={status}
          value={value}
          placeholder="Type your answer"
          label="Type your answer"
          onChange={onChange}
          onSend={onSend}
          onVoice={onVoice}
        />
      }
    >
      <div className={styles.content}>
        <KnowieSays className={styles.knowie} body={question}>
          {hints.length > 0 ? (
            <HintChips hints={hints} onOpen={onOpenHint} />
          ) : null}
        </KnowieSays>

        {notice ? (
          <div className={styles.notice}>
            <StatusNotice
              body={NOTICES[notice].body}
              retryCTA={NOTICES[notice].retryCTA}
              onRetry={onRetry}
            />
          </div>
        ) : null}
      </div>
    </Screen>
  );
}
