'use client';

import { useState } from 'react';
import { Screen } from '../../_components/screen/Screen';
import { ButtonGroup } from '../../_components/buttonGroup/ButtonGroup';
import { MascotSlot } from '../../_components/mascotSlot/MascotSlot';
import { TextBlock } from '../../_components/textBlock/TextBlock';
import { CheckboxRow } from '../../_components/checkboxRow/CheckboxRow';
import { QUESTION_COUNT, SECTION_TITLE } from '../../_recall/script';
import {
  requestMicrophone as realRequestMicrophone,
  type RequestMicrophone,
} from '../../_recall/microphone';
import styles from './Primer.module.css';

export type PrimerProps = {
  /** Knowie's opening line. Defaults to the copy frame 02 carries. */
  knowieLine?: string;
  /**
   * Fires the OS permission prompt. Defaults to the real `getUserMedia` call —
   * stories pass a stub, because headless Chromium has no one to answer it.
   */
  requestMicrophone?: RequestMicrophone;
  /** Called with what the browser said, once the student has answered it. */
  onPermission?: (permission: 'granted' | 'denied') => void;
  /** "I'd rather type" — start the session in text. Never asks for the mic. */
  onTypeInstead?: () => void;
  /** Whether the voice turn starts and sends on a tap instead of a hold. */
  tapMode?: boolean;
  onTapModeChange?: (tapMode: boolean) => void;
};

const DEFAULT_LINE = `Nice work finishing ${SECTION_TITLE}. Let's talk through what stuck.`;

/** Mirrors VoiceTurn's hint ladders, so what the primer teaches is what the turn says. */
const HOW_IT_WORKS = {
  hold: 'Hold the circle while you talk, then let go to send. Slide away to cancel.',
  tap: 'Tap the circle to start talking, then tap again to send.',
};

/**
 * Entry + mic primer — the first thing the student sees, and the screen that
 * earns the permission prompt (SPEC.md §3).
 *
 * The prompt fires from the tap on "let's get started", never on mount: you
 * get one per feature, and a request the student did not ask for is the one
 * most likely to be refused (Voice UX Reference, principle 3). So the screen
 * says what the mic is for before asking.
 *
 * It is the only place the hold gesture is explained, so the tap-mode toggle
 * sits beside that explanation. "I'd rather type" is the escape: it skips the
 * prompt entirely and starts the session in text.
 */
export function Primer({
  knowieLine = DEFAULT_LINE,
  requestMicrophone = realRequestMicrophone,
  onPermission,
  onTypeInstead,
  tapMode = false,
  onTapModeChange,
}: PrimerProps) {
  const [asking, setAsking] = useState(false);

  const start = async () => {
    // Guards a second prompt while the first is still on screen.
    if (asking) return;
    setAsking(true);
    try {
      onPermission?.(await requestMicrophone());
    } finally {
      setAsking(false);
    }
  };

  return (
    <Screen
      /* Frame 02's topNavigation is empty: the session has not started, so
         there is no progress to show and nothing to skip. */
      bottom={
        <ButtonGroup
          variant="Vertical"
          size="L"
          primaryCTA="Let's get started"
          secondaryCTA="I'd rather type"
          onPrimaryClick={start}
          onSecondaryClick={onTypeInstead}
        />
      }
    >
      <div className={styles.content}>
        <div className={styles.intro}>
          {/* Frame 02 centres Knowie at 3XL above the copy. */}
          <MascotSlot size="3XL" expression="standby" />

          {/*
            A bare text node, not a calloutBubble. Frame 02 draws it this way:
            centred under a centred mascot, the bubble's fixed left-pointing
            tail points at nothing (MascotSlot's "Above a calloutBubble" story).
          */}
          <p className={styles.line}>{knowieLine}</p>
        </div>

        <div className={styles.explainer}>
          <TextBlock
            variant="M"
            title={`You'll explain ${QUESTION_COUNT} answers out loud, and Knowie replies in text. We'll ask to use your mic for that.`}
            caption={tapMode ? HOW_IT_WORKS.tap : HOW_IT_WORKS.hold}
          />
          <CheckboxRow
            label="Tap to start and stop instead of holding"
            checked={tapMode}
            onCheckedChange={onTapModeChange}
          />
        </div>
      </div>
    </Screen>
  );
}
