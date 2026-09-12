'use client';

import type { HTMLAttributes } from 'react';
import styles from './ChatInput.module.css';
import { ButtonIcon } from '../buttonIcon/ButtonIcon';
import { AddIcon, CloseIcon, MicIcon, SendIcon } from '../icons/UiIcons';
import { LoadingIcon } from '../button/icons';

/** Figma variant property `Status`. */
export type ChatInputStatus =
  | 'Inactive'
  | 'Typing'
  | 'Ready to send'
  | 'Recording'
  | 'Loading'
  | 'Long input';

const STATUS_CLASS: Record<ChatInputStatus, string> = {
  Inactive: styles.inactive,
  Typing: styles.typing,
  'Ready to send': styles.readyToSend,
  Recording: styles.recording,
  Loading: styles.loading,
  'Long input': styles.longInput,
};

/** The statuses that show a send button, i.e. the ones with something to send. */
const SENDABLE: ChatInputStatus[] = ['Ready to send', 'Recording', 'Long input'];

/**
 * Figma's waveform is 33 bars, faded at both ends. The heights repeat across
 * real Icon tokens rather than arbitrary values, so every bar is a token step —
 * the same approach voiceCircle's waveform takes.
 */
const BAR_COUNT = 33;
const BAR_CLASSES = [styles.bar1, styles.bar2, styles.bar3, styles.bar4];

export type ChatInputProps = {
  /** Figma variant `Status`. */
  status?: ChatInputStatus;
  /**
   * What the student has typed. Shown by `Ready to send` and `Long input`;
   * ignored by the other statuses, which have nothing typed yet.
   */
  value?: string;
  /** Placeholder copy, shown while the field is empty. */
  placeholder?: string;
  /**
   * The field's accessible name, e.g. "Type your answer". Required: the design
   * has no visible label, and a bare placeholder is not a name.
   */
  label: string;
  onChange?: (value: string) => void;
  /** The leading action: attach, in every status except `Recording`. */
  onAdd?: () => void;
  /** The leading action in `Recording`: cancel the take before sending. */
  onCancel?: () => void;
  /** The mic, shown when there is nothing to send. */
  onVoice?: () => void;
  /** Explicit send. Never automatic — the student always presses it. */
  onSend?: () => void;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'>;

/**
 * The chat input bar: the text path through a turn, and the recall loop's text
 * fallback.
 *
 * Voice stays the primary affordance, but text is always reachable in one tap —
 * the Voice UX Reference calls this accessibility, not a nice-to-have.
 *
 * `Recording` is push-to-talk: the waveform runs while the student holds the
 * mic, and sending is always an explicit press. Nothing here detects when they
 * stop talking.
 */
export function ChatInput({
  status = 'Inactive',
  value,
  placeholder,
  label,
  onChange,
  onAdd,
  onCancel,
  onVoice,
  onSend,
  className,
  ...rest
}: ChatInputProps) {
  const classes = [styles.chatInput, STATUS_CLASS[status], className]
    .filter(Boolean)
    .join(' ');

  const isRecording = status === 'Recording';
  const isLong = status === 'Long input';
  const showSend = SENDABLE.includes(status);
  const showText = !isRecording;

  return (
    <div className={classes} {...rest}>
      {/* Figma's leading "OLD Icon Button": attach, or cancel while recording. */}
      <ButtonIcon
        variant="Secondary"
        size="L"
        className={styles.lead}
        icon={isRecording ? <CloseIcon /> : <AddIcon />}
        label={isRecording ? 'Cancel recording' : 'Add attachment'}
        onClick={isRecording ? onCancel : onAdd}
      />

      <div className={styles.field}>
        {/* Figma draws a caret before the placeholder in Typing. */}
        {status === 'Typing' ? <span className={styles.caret} aria-hidden="true" /> : null}

        {showText ? (
          isLong ? (
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              aria-label={label}
              placeholder={placeholder}
              value={value ?? ''}
              readOnly={!onChange}
              rows={4}
              onChange={(event) => onChange?.(event.target.value)}
            />
          ) : (
            <input
              type="text"
              className={styles.input}
              aria-label={label}
              placeholder={placeholder}
              value={value ?? ''}
              readOnly={!onChange}
              onChange={(event) => onChange?.(event.target.value)}
            />
          )
        ) : (
          // Figma's "Audio Input": the live waveform, decorative because the
          // status is already announced below.
          <span className={styles.waveform} aria-hidden="true">
            {Array.from({ length: BAR_COUNT }, (_, i) => (
              <span
                key={i}
                className={`${styles.bar} ${BAR_CLASSES[i % BAR_CLASSES.length]}`}
              />
            ))}
          </span>
        )}

        {status === 'Loading' ? (
          <span className={styles.spinner} aria-hidden="true">
            <LoadingIcon size="var(--dimension-icon-300)" />
          </span>
        ) : null}

        {/* The mic while there is nothing to send; the send button once there
            is. Both are real controls, so either path is reachable in one tap. */}
        {!showSend && status !== 'Loading' ? (
          <button
            type="button"
            className={styles.fieldAction}
            aria-label="Switch to speaking"
            onClick={onVoice}
          >
            <MicIcon size="var(--dimension-icon-300)" />
          </button>
        ) : null}

        {showSend ? (
          <ButtonIcon
            variant="Primary"
            size="M"
            className={styles.send}
            icon={<SendIcon />}
            label="Send"
            onClick={onSend}
          />
        ) : null}
      </div>

      {/* Recording and Loading are conveyed by a waveform and a spinner alone,
          so they are announced here. */}
      <span className={styles.visuallyHidden} role="status">
        {isRecording ? 'Recording. Press send when you are done.' : null}
        {status === 'Loading' ? 'Checking your answer' : null}
      </span>
    </div>
  );
}
