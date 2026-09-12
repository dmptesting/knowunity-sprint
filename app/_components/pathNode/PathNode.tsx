'use client';

import type { ButtonHTMLAttributes } from 'react';
import styles from './PathNode.module.css';
import { AiQuizIcon, MicIcon } from '../icons/PathNodeIcons';

/** Figma variant property `progress`. */
export type PathNodeProgress = 'completed' | 'current' | 'upcoming';
/** Figma variant property `format`. */
export type PathNodeFormat = 'quiz' | 'explainOutLoud';

const MARKER_CLASS: Record<PathNodeProgress, string> = {
  completed: styles.markerCompleted,
  current: styles.markerCurrent,
  upcoming: styles.markerUpcoming,
};

/** Spoken for screen readers, since progress is otherwise colour-only. */
const PROGRESS_TEXT: Record<PathNodeProgress, string> = {
  completed: 'completed',
  current: 'current step',
  upcoming: 'upcoming',
};

/** Spoken for screen readers, since format is otherwise icon-only. */
const FORMAT_TEXT: Record<PathNodeFormat, string> = {
  quiz: 'quiz',
  explainOutLoud: 'explain out loud',
};

export type PathNodeProps = {
  /** Figma variant `progress`. */
  progress?: PathNodeProgress;
  /** Figma variant `format`. */
  format?: PathNodeFormat;
  /**
   * The lesson title. Figma's Label is a plain text layer rather than an
   * exposed component property, so this has no Figma name to match and no
   * default — a node should never render placeholder copy.
   */
  label: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

/**
 * A step in the study-plan learning path. Shows completion state
 * (completed/current/upcoming) and which flow tapping it opens (quiz or
 * explain-out-loud voice recall).
 *
 * Reach for it to build any path/roadmap list.
 *
 * Don't change its Label to anything longer than a lesson title; it isn't
 * built to wrap.
 *
 * Deliberate departure from Figma: `completed` shows its own format icon
 * rather than check-circle. See the Storybook docs for why.
 */
export function PathNode({
  progress = 'completed',
  format = 'quiz',
  label,
  className,
  type = 'button',
  ...rest
}: PathNodeProps) {
  const classes = [styles.pathNode, className].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      aria-current={progress === 'current' ? 'step' : undefined}
      {...rest}
    >
      <span className={`${styles.marker} ${MARKER_CLASS[progress]}`}>
        {/* The icon says what the step is; the marker fill says how far along
            you are. Every progress state shows its own format icon. */}
        <span className={styles.iconSlot}>
          {format === 'quiz' ? <AiQuizIcon /> : <MicIcon />}
        </span>
      </span>

      <span className={styles.label}>{label}</span>

      {/* Progress and format are conveyed visually by colour and icon alone,
          so they are spelled out for screen readers here. */}
      <span className={styles.visuallyHidden}>
        {`, ${FORMAT_TEXT[format]}, ${PROGRESS_TEXT[progress]}`}
      </span>
    </button>
  );
}
