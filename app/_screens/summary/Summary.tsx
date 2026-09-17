'use client';

import { Screen } from '../../_components/screen/Screen';
import { Button } from '../../_components/button/Button';
import { StatTile } from '../../_components/statTile/StatTile';
import { MascotSlot } from '../../_components/mascotSlot/MascotSlot';
import { CalloutBubble } from '../../_components/calloutBubble/CalloutBubble';
import {
  QUESTION_COUNT,
  SECTION_TITLE,
  SUMMARY_FALLBACK_LINE,
} from '../../_recall/script';
import styles from './Summary.module.css';

export type SummaryProps = {
  /** How many questions were answered unaided or with hints — never `x/5`. */
  correct: number;
  /** Total XP, already reduced for every hint viewed. */
  xp: number;
  /** Real elapsed seconds, with processing and hint-reading paused out. */
  elapsedSeconds: number;
  /**
   * Knowie's closing line: the best part of one passed explanation played back
   * to the student, or the canned line when nothing passed. The session picks
   * it (`pickRecallLine`); defaults to the canned line.
   */
  recallLine?: string;
  /** The section this recall step followed. */
  section?: string;
  /** Back to the study plan path. */
  onContinue?: () => void;
};

/** m:ss. Minutes are never padded; seconds always are. */
export function formatElapsed(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Session complete.
 *
 * Three numbers, because the hint-for-XP trade has to be visible to the
 * student rather than only tracked internally (sprint-context.md). A student
 * who took two hints should be able to see what it cost.
 *
 * **`x/4`, never `x/5`.** The session is four questions, one per quiz in the
 * section just completed. Figma 09 reads `4/5`, which is the count this spec
 * overrides.
 */
export function Summary({
  correct,
  xp,
  elapsedSeconds,
  recallLine = SUMMARY_FALLBACK_LINE,
  section = SECTION_TITLE,
  onContinue,
}: SummaryProps) {
  return (
    <Screen
      bottom={
        <Button
          variant="Primary"
          size="L"
          CTA="Back to study plan"
          onClick={onContinue}
        />
      }
    >
      <div className={styles.content}>
        {/*
          Two bare text nodes, each bound to a real text style. Figma 09 sets
          the eyebrow at Headline XXS Bold and the headline at Headline S (21px),
          and textBlock's ladder has no 21px step — its L is 44px and its M is
          18px, and both put the caption under the title rather than an eyebrow
          over it. design-system.md allows exactly this: "textBlock, or a bare
          text node bound to a real text style if textBlock's title+caption
          shape doesn't fit the state".
        */}
        <p className={styles.section}>{section}</p>

        <h1 className={styles.headline}>
          {correct > 0
            ? "Nice work, that's the section done."
            : "That's the section done."}
        </h1>

        <div className={styles.stats}>
          <StatTile stat="xp" value={`+${xp}`} />
          <StatTile stat="correct" value={`${correct}/${QUESTION_COUNT}`} />
          <StatTile stat="time" value={formatElapsed(elapsedSeconds)} />
        </div>

        {/*
          Knowie, then what he remembers — proof he was listening. Excited when
          he is playing back a passed answer; on standby with the canned line,
          since nothing passed and SPEC.md keeps him from wearing a reaction at
          a student who struggled. Decorative: the bubble carries the words.
          The bubble is under him, not beside him, so it has no tail.
        */}
        <div className={styles.knowie}>
          <MascotSlot size="3XL" expression={correct > 0 ? 'excited' : 'standby'} />
          <CalloutBubble body={recallLine} showTail={false} />
        </div>
      </div>
    </Screen>
  );
}
