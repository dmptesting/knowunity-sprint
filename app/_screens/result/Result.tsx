'use client';

import { Screen } from '../../_components/screen/Screen';
import { AppBar } from '../../_components/appBar/AppBar';
import { Button } from '../../_components/button/Button';
import { ButtonGroup } from '../../_components/buttonGroup/ButtonGroup';
import {
  ProgressIndicator,
  type ProgressIndicatorProgress,
} from '../../_components/progressIndicator/ProgressIndicator';
import { MascotSlot } from '../../_components/mascotSlot/MascotSlot';
import { TextBlock } from '../../_components/textBlock/TextBlock';
import {
  VerdictHeader,
  type Verdict,
} from '../../_components/verdictHeader/VerdictHeader';
import { CloseIcon } from '../../_components/icons/UiIcons';
import { VERDICT_LABEL, type Feedback } from '../../_recall/script';
import styles from './Result.module.css';

export type ResultProps = {
  /**
   * How the attempt was judged. `partial` and `fail` are the same screen —
   * same components, same layout, different copy, exactly as SPEC.md decided.
   */
  verdict: Verdict;
  /**
   * What the mock speech-to-text heard. Shown so a miss reads as "it misheard
   * me" rather than "I failed" — and deliberately not editable, because typing
   * corrections would put back the keyboard friction voice exists to remove.
   */
  transcript: string;
  /** Knowie's read on the attempt: the judgement, then the nudge. */
  feedback: Feedback;
  /** Overrides the shared word for this verdict. Rarely needed. */
  label?: string;
  /** Where the session is. Does not move on a re-attempt. */
  progress?: ProgressIndicatorProgress;
  /** Dismiss. Surfaces the abandon sheet, per x-close's meaning. */
  onClose?: () => void;
  /** The header's skip — straight to the next question, no answer, no XP. */
  onSkip?: () => void;
  /** Back into a re-attempt at the same question. A miss only. */
  onTryAgain?: () => void;
  /** Spend the next hint tier, then return to a re-attempt. A miss only. */
  onViewHint?: () => void;
  /** Straight on. A pass only — there is nothing to try again. */
  onNext?: () => void;
};

/** The label above the transcript. Names whose words these are. */
const TRANSCRIPT_LABEL = 'What we heard';

/**
 * Result — how the attempt was judged.
 *
 * Two states share this screen: `partial` and `fail`. SPEC.md is explicit that
 * they are the same components in the same layout and the distinction is copy
 * only — partial acknowledges what was right, fail stays encouraging without
 * inventing credit.
 *
 * Neither miss gets a coloured panel. `feedback/success/subtle` is painted
 * behind a **pass** only — the one feedback token that can only feel good —
 * and no error or warning surface is ever painted behind a miss.
 */
export function Result({
  verdict,
  transcript,
  feedback,
  label,
  progress = '50',
  onClose,
  onSkip,
  onTryAgain,
  onViewHint,
  onNext,
}: ResultProps) {
  const passed = verdict === 'pass';

  return (
    <Screen
      top={
        <AppBar
          variant="leftAndRightButton"
          leftIcon={<CloseIcon />}
          leftLabel="Close"
          rightCTA="Skip"
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
        passed ? (
          /* A pass has nothing to try again and no hint to spend, so Figma 06's
             single action is the right shape. */
          <Button variant="Primary" size="L" CTA="Next question" onClick={onNext} />
        ) : (
          <ButtonGroup
            variant="Vertical"
            size="L"
            primaryCTA="Try again"
            secondaryCTA="View hint"
            onPrimaryClick={onTryAgain}
            onSecondaryClick={onViewHint}
          />
        )
      }
    >
      <div className={styles.content}>
        <div className={`${styles.panel} ${passed ? styles.passed : ''}`}>
          {/*
            Knowie's reaction, and on a pass the main event — 3XL, with the
            checkmark that used to sit under him removed. SPEC.md's resolved
            item 4 assigns `approving` on a pass; the designer chose
            `giggling`, which is warmer and reads at this size. `standby` on
            partial and fail either way: "warmth only where it cannot misfire;
            Knowie never wears a reaction aimed at a student who struggled".

            No bubble, so this is a bare MascotSlot rather than knowieSays:
            the words on this screen are the student's transcript and the
            judgement of it, and neither is Knowie speaking.
          */}
          <MascotSlot
            className={styles.mascot}
            size="3XL"
            expression={passed ? 'giggling' : 'standby'}
          />

          <VerdictHeader verdict={verdict} label={label ?? VERDICT_LABEL[verdict]} />

          {/*
            What was heard, first — and deliberately the quietest block on the
            screen. It was a textBlock at the same size as the feedback below,
            which left two competing headlines and no way to tell at a glance
            what had happened.

            textBlock has no step between M (18/12) and S (15/9), and S's
            caption is unreadable at 9px, so this is a bare region bound to
            real text styles — which design-system.md allows exactly here:
            "textBlock, or a bare text node bound to a real text style if
            textBlock's title+caption shape doesn't fit the state".

            A calloutBubble would be wrong: it is Knowie's speech bubble, and
            these are the student's words, on the one screen whose job is
            showing what we heard *them* say.
          */}
          <div className={styles.transcript}>
            <p className={styles.transcriptLabel}>{TRANSCRIPT_LABEL}</p>
            <p className={styles.transcriptBody}>{transcript}</p>
          </div>

          {/* Then the feedback — the loudest thing after the mascot. */}
          <TextBlock
            className={styles.centred}
            variant="M"
            title={feedback.headline}
            caption={feedback.detail}
          />
        </div>
      </div>
    </Screen>
  );
}
