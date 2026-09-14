'use client';

import { Screen } from '../../_components/screen/Screen';
import { ButtonGroup } from '../../_components/buttonGroup/ButtonGroup';
import { MascotSlot } from '../../_components/mascotSlot/MascotSlot';
import styles from './PermissionDenied.module.css';

export type PermissionDeniedProps = {
  /** The message. Names what happened without making it a failure. */
  message?: string;
  /** How to get the mic back, for a student who wants to. Deliberately quiet. */
  recovery?: string;
  /** Carry on in text. The session switches modes and keeps going. */
  onContinueInText?: () => void;
  /** For a student who has just changed the setting and wants another go. */
  onTryAgain?: () => void;
};

const DEFAULT_MESSAGE = "No microphone, no problem. We can do this in text instead.";
const DEFAULT_RECOVERY =
  'Want to use your voice after all? Allow the microphone for this site in your browser settings, then try the mic again.';

/**
 * Permission denied → text.
 *
 * The dead end the feature cannot afford. Getting a refused permission back
 * means digging through OS or browser settings, so this screen does two
 * things: it says how, and it makes sure the student does not have to. Text is
 * the primary action; the mic is the optional one.
 *
 * **Composed like the primer, because it is the primer's other outcome** — the
 * same tap on "let's get started", answered no. Centred mascot, one large
 * message, and the recovery steps pitched well below it: they are for the few
 * who want their voice back, not the headline.
 *
 * There is no apology and no error treatment. Refusing the mic is a reasonable
 * choice — the student may be on a bus — and the session continues either way.
 */
export function PermissionDenied({
  message = DEFAULT_MESSAGE,
  recovery = DEFAULT_RECOVERY,
  onContinueInText,
  onTryAgain,
}: PermissionDeniedProps) {
  return (
    <Screen
      bottom={
        <ButtonGroup
          variant="Vertical"
          size="L"
          primaryCTA="Continue in text"
          secondaryCTA="Try the mic again"
          onPrimaryClick={onContinueInText}
          onSecondaryClick={onTryAgain}
        />
      }
    >
      <div className={styles.content}>
        <MascotSlot className={styles.mascot} size="3XL" expression="standby" />
        <p className={styles.message}>{message}</p>
        <p className={styles.recovery}>{recovery}</p>
      </div>
    </Screen>
  );
}
