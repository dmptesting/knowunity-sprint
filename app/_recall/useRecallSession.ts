'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  RECALL_SCRIPT,
  QUESTION_COUNT,
  type Verdict,
  type RecallQuestion,
} from './script';
import type { NoticeKind } from './notices';
import type { ProgressIndicatorProgress } from '../_components/progressIndicator/ProgressIndicator';

/** Where the student is in a single turn. */
/**
 * `reveal` is the reveal sheet over the turn — the ladder is spent and the
 * answer is one tap away. `answer` is the answer page that tap opens.
 */
export type TurnPhase = 'idle' | 'processing' | 'result' | 'reveal' | 'answer' | 'notice';

/** Which way the session takes answers. Sticky once switched. */
export type InputMode = 'voice' | 'text';

/** What the browser said about the microphone. */
export type PermissionStatus = 'unknown' | 'granted' | 'denied';

/**
 * XP per question, by how much help it took.
 *
 * "Each hint viewed reduces the XP recorded for that question, so two hints
 * costs more than one, because a hinted answer can't count the same as unaided
 * recall in the summary" (sprint-context.md). A reveal or a skip scores
 * nothing — there was no recall to reward.
 */
export const XP_UNAIDED = 10;
export const XP_AFTER_ONE_HINT = 6;
export const XP_AFTER_TWO_HINTS = 3;

export function xpFor(hintsUsed: number): number {
  if (hintsUsed <= 0) return XP_UNAIDED;
  if (hintsUsed === 1) return XP_AFTER_ONE_HINT;
  return XP_AFTER_TWO_HINTS;
}

/** The mock judge's fixed delay. Long enough to see, short enough to click through. */
export const PROCESSING_MS = 2000;

const PROGRESS_STEPS: ProgressIndicatorProgress[] = ['0', '25', '50', '75', '100'];

/** How a question ended. Drives the summary and the path node. */
export type QuestionOutcome = 'passed' | 'revealed' | 'skipped';

export type UseRecallSessionOptions = {
  /** Overridden by the `?verdict=` dev control. */
  forcedVerdict?: Verdict | NoticeKind;
  /** Starts the session in text mode — the primer's "I'd rather type". */
  initialMode?: InputMode;
  /** Swappable so tests do not wait two real seconds per turn. */
  processingMs?: number;
  /**
   * Start on this question (zero-based) instead of the first. For the
   * `?question=` dev control only — questions before it are recorded as
   * skipped, so progress and the summary stay honest about what was answered.
   */
  startIndex?: number;
  /**
   * Start with this many hints already spent on that question, 0-2. For the
   * `?hints=` dev control only. The attempt counter moves with them, exactly
   * as spending them by hand would, so the next take gets the verdict the
   * script would give at that point on the ladder.
   */
  startHintsUsed?: number;
};

/**
 * The session: which question, where in the turn, how much of the ladder is
 * spent, what it is worth, how long it took, and which way answers arrive.
 *
 * Verdicts are **scripted per question** and ignore what the student actually
 * says — Q1 passes, Q2 returns empty then partial then passes after hint 1, Q3
 * rides the ladder to reveal, Q4 passes. Every state appears once, difficulty
 * peaks in the middle, and the session ends on a win.
 */
export function useRecallSession({
  forcedVerdict,
  initialMode = 'voice',
  processingMs = PROCESSING_MS,
  startIndex = 0,
  startHintsUsed = 0,
}: UseRecallSessionOptions = {}) {
  const [index, setIndex] = useState(startIndex);
  const [phase, setPhase] = useState<TurnPhase>('idle');
  /** Which scripted attempt this question is on. Reset per question. */
  // Each hint viewed also moves the attempt on, so starting with hints spent
  // means starting that many attempts in.
  const [attempt, setAttempt] = useState(startHintsUsed);
  /** 0, 1 or 2. Charged only by viewing a hint, never by a notice. */
  const [hintsUsed, setHintsUsed] = useState(startHintsUsed);
  const [outcomes, setOutcomes] = useState<QuestionOutcome[]>(() =>
    Array.from({ length: startIndex }, () => 'skipped' as const),
  );
  const [xp, setXp] = useState(0);
  const [mode, setMode] = useState<InputMode>(initialMode);
  const [permission, setPermission] = useState<PermissionStatus>('unknown');
  const [tapMode, setTapMode] = useState(false);
  const [notice, setNotice] = useState<NoticeKind | undefined>(undefined);
  const [finished, setFinished] = useState(false);
  /*
   * True from tapping "view hint" until the next take starts. The hint itself
   * stays on the turn screen for the rest of the question — this only marks
   * the stretch where the student is reading rather than explaining, so the
   * timer can leave it out.
   */
  const [readingHint, setReadingHint] = useState(false);

  const question: RecallQuestion | undefined = RECALL_SCRIPT[index];

  /* ---------------------------------------------------------------- timer --- */
  /*
   * Real elapsed, with processing and hint-reading paused out (SPEC.md). The
   * clock runs only while the student could actually be explaining, so the
   * stat measures them rather than the mock judge.
   */
  const [elapsedMs, setElapsedMs] = useState(0);
  const runningSince = useRef<number | null>(null);
  const clockRuns = !finished && phase !== 'processing' && !readingHint;

  useEffect(() => {
    if (!clockRuns) {
      runningSince.current = null;
      return;
    }
    runningSince.current = Date.now();
    const id = setInterval(() => {
      const started = runningSince.current;
      if (started === null) return;
      const now = Date.now();
      runningSince.current = now;
      setElapsedMs((ms) => ms + (now - started));
    }, 250);
    return () => {
      const started = runningSince.current;
      if (started !== null) setElapsedMs((ms) => ms + (Date.now() - started));
      runningSince.current = null;
      clearInterval(id);
    };
  }, [clockRuns]);

  /* ------------------------------------------------------------- verdicts --- */

  /** What the script says this attempt returns. */
  const scriptedAttempt = question?.attempts[Math.min(attempt, question.attempts.length - 1)];

  /*
   * `?verdict=` has to change what is *shown*, not just which phase is
   * reached — forcing a fail and then reading the scripted pass's transcript
   * would make the dev control useless for review.
   *
   * The copy comes from a real scripted attempt with that verdict: this
   * question's own if it has one, otherwise the first anywhere in the script.
   * The fallback can pair one question's prompt with another's transcript,
   * which is a known and acceptable seam in a control only reachable by URL.
   */
  const shownAttempt = useMemo(() => {
    if (!forcedVerdict) return scriptedAttempt;
    if (forcedVerdict === 'pass' || forcedVerdict === 'partial' || forcedVerdict === 'fail') {
      return (
        question?.attempts.find((a) => a.verdict === forcedVerdict) ??
        RECALL_SCRIPT.flatMap((q) => q.attempts).find((a) => a.verdict === forcedVerdict) ??
        scriptedAttempt
      );
    }
    return scriptedAttempt;
  }, [forcedVerdict, question, scriptedAttempt]);

  const advance = useCallback(
    (outcome: QuestionOutcome, earned: number) => {
      setOutcomes((prev) => [...prev, outcome]);
      setXp((prev) => prev + earned);
      setAttempt(0);
      setHintsUsed(0);
      setNotice(undefined);
      setReadingHint(false);
      if (index + 1 >= QUESTION_COUNT) {
        setFinished(true);
        setPhase('idle');
      } else {
        setIndex(index + 1);
        setPhase('idle');
      }
    },
    [index],
  );

  /*
   * The mock judge's timer, held so it can be cleared if the session unmounts
   * mid-turn — otherwise a verdict lands on a component that has gone.
   */
  const judging = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (judging.current) clearTimeout(judging.current);
  }, []);

  /** An explicit send — a released hold, a tap, or a typed answer. */
  const submit = useCallback(() => {
    if (!question) return;
    setPhase('processing');

    setReadingHint(false);

    if (judging.current) clearTimeout(judging.current);
    judging.current = setTimeout(() => {
      // The dev control wins, so every state has a linkable URL.
      const verdict = forcedVerdict ?? scriptedAttempt?.verdict;

      if (
        verdict === 'empty' ||
        verdict === 'garbled' ||
        verdict === 'timeoutSoft' ||
        verdict === 'timeoutRetry' ||
        verdict === 'network'
      ) {
        // Free: nothing was judged, so the ladder is not charged. The attempt
        // counter still moves on, so the script's next line is what follows.
        setNotice(verdict);
        setPhase('notice');
        if (verdict === 'empty' || verdict === 'garbled') setAttempt((n) => n + 1);
        return;
      }

      if (verdict === 'pass') {
        // The result sheet holds until the student taps on; advancing here
        // would skip past their own win.
        setPhase('result');
        return;
      }

      // A miss. Once both hints are spent the ladder is over: the reveal sheet
      // rises, and the answer is one tap away — reached only this way, never
      // by skipping.
      setPhase(hintsUsed >= 2 ? 'reveal' : 'result');
    }, processingMs);
  }, [question, forcedVerdict, scriptedAttempt, hintsUsed, processingMs]);

  /* -------------------------------------------------------------- actions --- */

  const retry = useCallback(() => {
    // Free retries (empty, garbled, network) do not charge the ladder.
    setNotice(undefined);
    setPhase('idle');
  }, []);

  const tryAgain = useCallback(() => {
    setAttempt((n) => n + 1);
    setPhase('idle');
  }, []);

  /**
   * Spend the next rung. Viewing a hint routes straight back into a
   * re-attempt — it never auto-reveals and never auto-advances
   * (sprint-context.md) — and the hint stays on the turn screen while the
   * student records, rather than being a screen they have to dismiss first.
   */
  const viewHint = useCallback(() => {
    setHintsUsed((n) => Math.min(2, n + 1));
    setAttempt((n) => n + 1);
    setReadingHint(true);
    setPhase('idle');
  }, []);

  /** The reveal sheet's "Reveal answer": from the sheet to the answer page. */
  const showAnswer = useCallback(() => setPhase('answer'), []);

  /** From a pass, or from the answer page. A reveal scores nothing. */
  const nextQuestion = useCallback(() => {
    if (phase === 'reveal' || phase === 'answer') advance('revealed', 0);
    else advance('passed', xpFor(hintsUsed));
  }, [advance, phase, hintsUsed]);

  /** Straight on. No answer shown, no XP. */
  const skip = useCallback(() => advance('skipped', 0), [advance]);

  const switchToText = useCallback(() => setMode('text'), []);
  const switchToVoice = useCallback(() => setMode('voice'), []);

  const recordPermission = useCallback((next: PermissionStatus) => {
    setPermission(next);
    // A refusal is not a dead end: the session carries on in text.
    if (next === 'denied') setMode('text');
  }, []);

  /* --------------------------------------------------------------- derived --- */

  const passed = outcomes.filter((o) => o === 'passed').length;

  const value = useMemo(
    () => ({
      question,
      index,
      phase,
      attempt,
      hintsUsed,
      /** The latest hint spent, or undefined before one is. */
      hint: question && hintsUsed > 0 ? question.hints[hintsUsed - 1] : undefined,
      /**
       * Every hint spent on this question, in order. Both stay reachable once
       * paid for — a student who has seen hint 2 may still want to re-read
       * hint 1, and both cost XP.
       */
      spentHints: question ? question.hints.slice(0, hintsUsed) : [],
      transcript: shownAttempt?.transcript ?? '',
      feedback: shownAttempt?.feedback,
      verdict: shownAttempt?.verdict,
      notice,
      mode,
      permission,
      tapMode,
      finished,
      xp,
      passed,
      outcomes,
      elapsedSeconds: Math.round(elapsedMs / 1000),
      /**
       * Questions finished, not attempts made — so it never moves on a
       * re-attempt.
       *
       * A correct answer counts **the moment its result sheet appears**, not
       * when the student taps "next question": the bar fills as the sheet
       * rises, so the win and the progress land together. The tap then
       * records the outcome, which moves `outcomes.length` up by the same one
       * this term stops adding — so it never counts twice.
       *
       * A miss does not count. The incorrect sheet sends the student back to
       * the same question, and a bar that filled there would have to empty
       * again on the retry.
       *
       * The reveal sheet does count, for the same reason a pass does: the
       * question is over the moment it rises, and every way on from it moves
       * forward.
       */
      progress:
        PROGRESS_STEPS[
          Math.min(
            outcomes.length +
              ((phase === 'result' && shownAttempt?.verdict === 'pass') ||
              phase === 'reveal' ||
              phase === 'answer'
                ? 1
                : 0),
            QUESTION_COUNT,
          )
        ],
      /**
       * "PathNode becomes progress='completed' only if at least one question
       * passed" (SPEC.md). Sitting through four misses is not a completed
       * node, and marking it done would overstate what happened.
       */
      pathNodeProgress: (finished && passed > 0 ? 'completed' : 'current') as
        | 'completed'
        | 'current',
      // actions
      submit,
      retry,
      tryAgain,
      viewHint,
      showAnswer,
      nextQuestion,
      skip,
      switchToText,
      switchToVoice,
      setTapMode,
      recordPermission,
    }),
    [
      question, index, phase, attempt, hintsUsed, shownAttempt, notice, mode,
      permission, tapMode, finished, xp, passed, outcomes, elapsedMs,
      submit, retry, tryAgain, viewHint, showAnswer, nextQuestion, skip,
      switchToText, switchToVoice, recordPermission,
    ],
  );

  return value;
}
