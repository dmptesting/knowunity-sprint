'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Primer } from '../_screens/primer/Primer';
import { PermissionDenied } from '../_screens/permissionDenied/PermissionDenied';
import { VoiceTurn } from '../_screens/voiceTurn/VoiceTurn';
import { TextTurn } from '../_screens/textTurn/TextTurn';
import {
  ResultSheet,
  type ResultSheetProps,
} from '../_screens/resultSheet/ResultSheet';
import { Reveal } from '../_screens/reveal/Reveal';
import { HintOverlay } from '../_screens/hintOverlay/HintOverlay';
import { Summary } from '../_screens/summary/Summary';
import { StudyPath } from '../_screens/studyPath/StudyPath';
import { AbandonSheet } from '../_screens/abandonSheet/AbandonSheet';
import { useRecallSession } from './useRecallSession';
import { useViewportHeight } from './useViewportHeight';
import { microphoneFor, readMicMode } from './microphone';
import { MISS_TITLE, QUESTION_COUNT, REVEAL_LINE } from './script';
import { NOTICES } from './notices';
import type { ChatInputStatus } from '../_components/chatInput/ChatInput';
import styles from './RecallSession.module.css';

/** What `?verdict=` accepts. Anything else is ignored. */
const FORCEABLE = [
  'pass',
  'partial',
  'fail',
  'empty',
  'garbled',
  'timeoutSoft',
  'timeoutRetry',
  'network',
] as const;

type Forceable = (typeof FORCEABLE)[number];

/**
 * `?question=` — which question to open on, 1-based as a person would say it.
 * Anything outside 1-4 is ignored, and the session starts on the path as usual.
 */
function readStartQuestion(value: string | null): number | undefined {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= QUESTION_COUNT ? n : undefined;
}

/** `?hints=` — how many hints are already spent on that question, 0-2. */
function readStartHints(value: string | null): number {
  const n = Number(value);
  return Number.isInteger(n) ? Math.min(2, Math.max(0, n)) : 0;
}

function readForcedVerdict(value: string | null): Forceable | undefined {
  return FORCEABLE.includes(value as Forceable) ? (value as Forceable) : undefined;
}

/**
 * The whole session, wired.
 *
 * **Must stay inside a `<Suspense>` boundary.** `useSearchParams` forces
 * client rendering up to the nearest one, and without it `next build` fails
 * during prerender — see `app/page.tsx`.
 *
 * The `?verdict=` control is a query param and nothing else: no in-screen
 * affordance, so there is nothing for a student to stumble onto, and every
 * state has a linkable URL for review.
 */
export function RecallSession() {
  useViewportHeight();

  const params = useSearchParams();
  const forcedVerdict = readForcedVerdict(params.get('verdict'));
  /*
   * Mocked unless asked otherwise. Nothing here records, so a real prompt
   * spends a one-per-origin decision the prototype does not need — and a
   * remembered "Block" strands the reviewer in text mode, unable to reach the
   * voice turn at all. `?mic=real` fires the genuine prompt; `?mic=deny`
   * forces a refusal so the denied screen is reviewable.
   */
  const requestMicrophone = microphoneFor(readMicMode(params.get('mic')));
  /*
   * Deep links for review, alongside ?verdict= and ?mic= — query params only,
   * so there is nothing in the interface for a student to stumble onto.
   *
   *   ?question=3          open question 3 fresh, and walk its hint ladder
   *   ?question=3&hints=2  open question 3 with both hints already spent
   *
   * Either one skips the study path and the primer and lands on the turn.
   */
  const startQuestion = readStartQuestion(params.get('question'));
  const startHints = startQuestion ? readStartHints(params.get('hints')) : 0;

  const session = useRecallSession({
    forcedVerdict,
    startIndex: startQuestion ? startQuestion - 1 : 0,
    startHintsUsed: startHints,
  });

  /*
   * Where the flow is. SPEC.md's out-of-scope note settles the entry:
   * "node tap only" — so the path is where a run begins and where every way
   * out returns to.
   */
  const [place, setPlace] = useState<'path' | 'session'>(
    startQuestion ? 'session' : 'path',
  );
  const [started, setStarted] = useState(Boolean(startQuestion));
  /*
   * Whether the student has answered the denied screen. Without it the screen
   * is unreachable: recording a refusal switches the session to text, so a
   * check on the mode alone would fall straight through to a text turn and the
   * student would never be told why.
   */
  const [deniedAcknowledged, setDeniedAcknowledged] = useState(false);
  const [abandoning, setAbandoning] = useState(false);
  /*
   * Which spent hint has the whole screen, by its position — or null when none
   * does. Opened automatically when a hint is first spent, and again from its
   * chip on the turn.
   */
  const [hintOverlay, setHintOverlay] = useState<number | null>(null);
  const [draft, setDraft] = useState('');

  const close = () => setAbandoning(true);

  /* Back to the path, with whatever the session earned left standing on it. */
  const leave = () => {
    setAbandoning(false);
    setPlace('path');
  };

  /* -------------------------------------------------------------- path --- */

  if (place === 'path') {
    return (
      <StudyPath
        explainProgress={session.pathNodeProgress}
        onExplain={() => setPlace('session')}
      />
    );
  }

  /* ------------------------------------------------------------- entry --- */

  if (!started) {
    return (
      <Primer
        requestMicrophone={requestMicrophone}
        onPermission={(permission) => {
          session.recordPermission(permission);
          // Started either way. A refusal is not a reason to stay on the
          // primer — it routes to the denied screen, which routes to text.
          setStarted(true);
        }}
        onTypeInstead={() => {
          // Text from the first question, and no prompt spent on a student
          // who has said they don't want the mic.
          session.switchToText();
          setStarted(true);
        }}
        tapMode={session.tapMode}
        onTapModeChange={session.setTapMode}
      />
    );
  }

  if (session.permission === 'denied' && !deniedAcknowledged) {
    return (
      <PermissionDenied
        onContinueInText={() => {
          session.switchToText();
          setDeniedAcknowledged(true);
        }}
        onTryAgain={() => {
          // Back to the primer, so the prompt is fired from a tap again
          // rather than cold — and so a student who has just changed the
          // setting gets the same explanation before it appears.
          session.recordPermission('unknown');
          session.switchToVoice();
          setStarted(false);
        }}
      />
    );
  }

  if (session.finished) {
    return (
      <Summary
        correct={session.passed}
        xp={session.xp}
        elapsedSeconds={session.elapsedSeconds}
        onContinue={leave}
      />
    );
  }

  /* -------------------------------------------------------------- turn --- */

  /*
   * A sheet slides up over the lower screen instead of replacing it, so the
   * question stays in view behind it. Only the question body is locked while
   * it is up — the circle under the sheet must not start a take — and the
   * header stays live, so close is never taken away.
   *
   * Which sheet, if any:
   *   correct    a pass
   *   incorrect  a miss with a hint still to spend
   *   unsure     nothing usable came through (empty or garbled) — free retry
   *   reveal     a miss with both hints spent; the answer is one tap away
   *
   * Timeouts and network failures keep their status notice: they are not
   * about what the student said, and the notice carries its own retry.
   */
  const verdict = session.verdict === 'empty' ? 'fail' : session.verdict;
  const unsureNotice =
    session.phase === 'notice' &&
    (session.notice === 'empty' || session.notice === 'garbled')
      ? session.notice
      : undefined;

  let sheet: ResultSheetProps | undefined;

  if (session.phase === 'result' && session.feedback && verdict === 'pass') {
    sheet = {
      result: 'correct',
      title: session.feedback.headline,
      summary: session.feedback.detail,
      // `giggling` on a pass, as chosen for the result screen this replaced.
      expression: 'giggling',
      // No next question after the last one: the button leads to the summary.
      lastQuestion: session.index === QUESTION_COUNT - 1,
      onContinue: session.nextQuestion,
    };
  } else if (session.phase === 'result' && session.feedback && verdict) {
    sheet = {
      result: 'incorrect',
      // Partial and fail share the sheet, so the title is what tells them
      // apart (SPEC.md: "the distinction is copy only"). Short on purpose — the
      // sheet never scrolls, and a title that wraps costs the summary a line.
      title: MISS_TITLE[verdict === 'partial' ? 'partial' : 'fail'],
      summary: session.feedback.detail,
      // The next hint on the ladder: 1 after the first miss, 2 after the second.
      hint: session.hintsUsed >= 1 ? 2 : 1,
      onTryAgain: session.tryAgain,
      onViewHint: (hint) => {
        session.viewHint();
        setHintOverlay(hint - 1);
      },
    };
  } else if (unsureNotice) {
    sheet = {
      result: 'unsure',
      title: 'Hmm, I missed that',
      summary: NOTICES[unsureNotice].body,
      onTryAgain: session.retry,
      onSkip: session.skip,
    };
  } else if (session.phase === 'reveal') {
    sheet = {
      result: 'reveal',
      title: "Let's look at the answer",
      summary: REVEAL_LINE,
      onReveal: session.showAnswer,
    };
  }

  const header = {
    onClose: close,
    onSkip: () => {
      setHintOverlay(null);
      session.skip();
    },
    progress: session.progress,
    locked: Boolean(sheet),
    /*
     * Skip is for a question still in play, and only where the sheet does not
     * already offer a way on. Gone on a correct sheet (the question is
     * answered; "next question" is the way on), on the reveal sheet (the
     * question is over) and on the unsure sheet (it carries its own "skip
     * question"). It stays on the incorrect sheet — that is the escape from
     * being funnelled into only "try again" or "view hint".
     */
    canSkip: !sheet || sheet.result === 'incorrect',
  };
  const question = session.question?.prompt ?? '';

  let screen;

  if (hintOverlay !== null && session.spentHints[hintOverlay]) {
    screen = (
      <HintOverlay
        body={session.spentHints[hintOverlay]}
        label={`Hint ${hintOverlay + 1}`}
        onDismiss={() => setHintOverlay(null)}
      />
    );
  } else if (session.phase === 'answer') {
    screen = (
      <Reveal
        answer={session.question?.answer ?? ''}
        onNext={session.nextQuestion}
      />
    );
  } else if (session.mode === 'text') {
    const status: ChatInputStatus =
      session.phase === 'processing'
        ? 'Loading'
        : draft.length > 0
          ? 'Ready to send'
          : 'Inactive';

    screen = (
      <TextTurn
        {...header}
        question={question}
        hints={session.spentHints}
        onOpenHint={setHintOverlay}
        status={status}
        value={draft}
        onChange={setDraft}
        onSend={() => {
          setDraft('');
          session.submit();
        }}
        onVoice={session.switchToVoice}
        notice={unsureNotice ? undefined : session.notice}
        onRetry={session.retry}
      />
    );
  } else {
    screen = (
      <VoiceTurn
        {...header}
        question={question}
        hints={session.spentHints}
        onOpenHint={setHintOverlay}
        processing={session.phase === 'processing'}
        notice={unsureNotice ? undefined : session.notice}
        tapMode={session.tapMode}
        onSend={session.submit}
        onRetry={session.retry}
        onTypeInstead={session.switchToText}
      />
    );
  }

  return (
    <div className={styles.session}>
      <div className={styles.turn}>{screen}</div>
      {/*
        Hidden while the abandon sheet is open — the header's close is live,
        and one sheet at a time. It comes straight back if they keep reviewing.
      */}
      {sheet && !abandoning ? (
        /* Keyed by result, so a change of sheet remounts it and moves focus. */
        <ResultSheet key={sheet.result} {...sheet} />
      ) : null}
      {abandoning ? (
        <AbandonSheet
          onKeepReviewing={() => setAbandoning(false)}
          onDismiss={() => setAbandoning(false)}
          onSwitchToTyping={() => {
            session.switchToText();
            setAbandoning(false);
          }}
          onLeave={leave}
        />
      ) : null}
    </div>
  );
}
