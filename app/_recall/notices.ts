/*
 * The four status notices, as copy.
 *
 * One region on the turn screen, four sets of words. None of them is an error:
 * every one of them says what happened and offers a way on, because the state
 * a student gets stuck in is the state that ends the session.
 *
 * DRAFT COPY, like script.ts — edit before anyone outside the team plays it.
 */

export type NoticeKind =
  | 'empty'
  | 'garbled'
  | 'timeoutSoft'
  | 'timeoutRetry'
  | 'network';

export type Notice = {
  body: string;
  /** Omitted where the notice is a wait rather than a decision. */
  retryCTA?: string;
  /**
   * Whether reaching this notice spends a rung of the hint ladder.
   *
   * Empty and garbled are **free**: nothing was judged, so charging the
   * student for a microphone that didn't hear them would punish them for our
   * failure. Timeout and network never reach a judge at all.
   */
  chargesLadder: false;
};

export const NOTICES: Record<NoticeKind, Notice> = {
  /* Nothing came through at all. */
  empty: {
    body: "Didn't catch that one — give it another go.",
    retryCTA: 'Try again',
    chargesLadder: false,
  },

  /* Something came through, but not enough of it to judge. */
  garbled: {
    body: 'That came through in pieces — want to try again?',
    retryCTA: 'Try again',
    chargesLadder: false,
  },

  /*
   * Past the 4s target. The copy softens and the processing state holds — it
   * never flips to an error, because the answer usually does arrive.
   */
  timeoutSoft: {
    body: 'Give me a second, still working this out…',
    chargesLadder: false,
  },

  /* Past 8s. Now there is something to decide, so offer the decision. */
  timeoutRetry: {
    body: "This is taking longer than it should — you can wait it out or say it again.",
    retryCTA: 'Say it again',
    chargesLadder: false,
  },

  /*
   * Progress and XP are kept. On return the same question reopens at idle and
   * the in-flight attempt is discarded — a half-sent answer is not judged.
   */
  network: {
    body: "You're offline, so this one didn't send. Your progress is saved.",
    retryCTA: 'Try again',
    chargesLadder: false,
  },
};

/** How long the mock judge takes before the soft and the offered-retry copy. */
export const TIMEOUT_SOFT_MS = 4000;
export const TIMEOUT_RETRY_MS = 8000;
