'use client';

import type { HTMLAttributes } from 'react';
import styles from './StatusNotice.module.css';
import { Button } from '../button/Button';

export type StatusNoticeProps = {
  /** What happened, in Knowie's voice but without his bubble. */
  body: string;
  /** The retry label. Omit for a notice that is a wait, not a decision. */
  retryCTA?: string;
  onRetry?: () => void;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

/**
 * One region, four copy sets: nothing heard, heard badly, taking too long, or
 * offline.
 *
 * USE: (unverified) on a turn screen, where the voice circle's hint line sits,
 * when something went wrong with the attempt rather than with the answer.
 *
 * DON'T: (unverified) don't use it for a verdict. A verdict is a judgement of
 * what the student said; this is a report that we couldn't judge it at all,
 * and the two must not look alike.
 *
 * Painted in `accent/brand/subtle` with `text/secondary` copy, per SPEC.md —
 * deliberately **not** `feedback/error` or `feedback/warning`. None of these
 * is the student's fault, and an alarm would say otherwise.
 *
 * It announces itself: `role="status"` so a screen reader hears the change
 * without the focus moving, which is the accessible form of the Voice UX
 * Reference's first principle — show system status at every moment.
 */
export function StatusNotice({
  body,
  retryCTA,
  onRetry,
  className,
  ...rest
}: StatusNoticeProps) {
  const classes = [styles.statusNotice, className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="status" {...rest}>
      <p className={styles.body}>{body}</p>
      {retryCTA ? (
        <Button variant="Secondary" size="M" CTA={retryCTA} onClick={onRetry} />
      ) : null}
    </div>
  );
}
