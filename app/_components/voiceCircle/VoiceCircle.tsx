'use client';

import type { HTMLAttributes } from 'react';
import styles from './VoiceCircle.module.css';
import { MicGlyph } from './MicGlyph';

/** Figma variant property `mode`. The set's only property. */
export type VoiceCircleMode = 'idle' | 'recording' | 'processing';

/**
 * Default accessible name per mode. voiceCircle is the only thing on screen
 * saying which part of the voice lifecycle the student is in, so it needs a
 * name rather than being hidden as decoration — Voice UX Reference, principle
 * 1: the current state must be obvious at all times.
 */
const MODE_LABEL: Record<VoiceCircleMode, string> = {
  idle: 'Ready to record',
  recording: 'Recording',
  processing: 'Checking your answer',
};

/** Figma "Bars": 5 bars, resting heights Icon/150, /400, /250, /400, /200. */
const BAR_CLASSES = [
  styles.bar1,
  styles.bar2,
  styles.bar3,
  styles.bar4,
  styles.bar5,
];

export type VoiceCircleProps = {
  /** Figma variant `mode`. */
  mode?: VoiceCircleMode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

/**
 * The animated circle that represents the AI's listening state during a spoken
 * recall answer.
 *
 * Reach for it anywhere the student can speak: idle before they start talking,
 * recording while their voice is being captured, processing while the answer is
 * being evaluated.
 *
 * Don't reuse it as a generic loading spinner; its three modes are tied
 * specifically to the voice-input lifecycle, not to loading states in general.
 */
export function VoiceCircle({
  mode = 'idle',
  className,
  ...rest
}: VoiceCircleProps) {
  const classes = [styles.voiceCircle, className].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      role="img"
      aria-label={MODE_LABEL[mode]}
      {...rest}
    >
      <div className={`${styles.layer} ${styles.halo}`} />
      <div className={`${styles.layer} ${styles.ring}`} />
      <div className={`${styles.layer} ${styles.core}`} />

      <div className={`${styles.layer} ${styles.content}`}>
        {mode === 'idle' ? (
          <span className={styles.icon}>
            <MicGlyph />
          </span>
        ) : null}

        {mode === 'recording' ? (
          <span className={styles.bars}>
            {BAR_CLASSES.map((barClass, i) => (
              <span key={i} className={`${styles.bar} ${barClass}`} />
            ))}
          </span>
        ) : null}

        {mode === 'processing' ? <span className={styles.thinkDot} /> : null}
      </div>
    </div>
  );
}
