'use client';

import { useState } from 'react';
import { Screen } from '../../_components/screen/Screen';
import { AppBar } from '../../_components/appBar/AppBar';
import { CloseIcon } from '../../_components/icons/UiIcons';
import { Button } from '../../_components/button/Button';
import { MascotSlot } from '../../_components/mascotSlot/MascotSlot';
import { SECTION_TITLE } from '../../_recall/script';
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
  /** Close — back to the study path. Nothing has started, so nothing to confirm. */
  onClose?: () => void;
};

const DEFAULT_LINE = `Nice work finishing ${SECTION_TITLE}. Let's talk through what stuck.`;

/**
 * Entry + mic primer — the first thing the student sees, and the screen that
 * earns the permission prompt.
 *
 * The prompt fires from the tap on "let's get started", never on mount: you
 * get one per feature, and a request the student did not ask for is the one
 * most likely to be refused (Voice UX Reference, principle 3).
 *
 * Deliberately bare — mascot, one line, one button, as Figma 02 draws it. It
 * previously carried a primer explanation, a text escape and a tap-mode
 * toggle; all three were removed on the designer's instruction. The text path
 * is still reachable from the turn itself and from a refused permission, so
 * nobody is trapped by their absence.
 */
export function Primer({
  knowieLine = DEFAULT_LINE,
  requestMicrophone = realRequestMicrophone,
  onPermission,
  onClose,
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
      /* Close only: the session has not started, so there is no progress to
         show and nothing to skip. */
      top={
        <AppBar
          variant="leftIconButtonOnly"
          leftIcon={<CloseIcon />}
          leftLabel="Close"
          onLeftClick={onClose}
        />
      }
      bottom={
        <Button
          variant="Primary"
          size="L"
          CTA="Let's get started"
          onClick={start}
        />
      }
    >
      <div className={styles.content}>
        {/* Frame 02 centres Knowie at 3XL above the copy. */}
        <MascotSlot className={styles.mascot} size="3XL" expression="standby" />

        {/*
          A bare text node, not a calloutBubble. Frame 02 draws it this way and
          it is the right call: centred under a centred mascot, the bubble's
          fixed left-pointing tail points at nothing, which is the open
          question MascotSlot's own story records.
        */}
        <p className={styles.line}>{knowieLine}</p>
      </div>
    </Screen>
  );
}
