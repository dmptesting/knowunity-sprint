/*
 * The scripted recall session.
 *
 * Nothing here is judged. The mock ignores what the student actually says and
 * plays the verdicts below in order, so every state in SPEC.md appears exactly
 * once, difficulty peaks in the middle, and the session ends on a win.
 *
 * DRAFT COPY. SPEC.md's "Open" section leaves one thing to be produced rather
 * than decided: these four questions, their answers, their hints and their
 * transcripts. This is that draft — edit it before anyone outside the team
 * plays the prototype.
 */

import type { Verdict as JudgedVerdict } from '../_components/verdictHeader/VerdictHeader';

/**
 * What the mock judge returns for one attempt.
 *
 * The three judged values come from verdictHeader, so there is one definition
 * of them. `empty` is not a judgement — nothing was heard, so the hint ladder
 * is not charged and the student gets a free retry (SPEC.md, status notices),
 * and no result sheet is shown.
 */
export type Verdict = JudgedVerdict | 'empty';

/**
 * The result sheet's title on a miss. Partial and fail share the `incorrect`
 * sheet, so this is the copy that tells them apart — one line per verdict,
 * shared across every question. Short, because the sheet never scrolls and a
 * wrapped title costs the summary a line. A pass takes its feedback headline
 * instead.
 */
export const MISS_TITLE: Record<Exclude<JudgedVerdict, 'pass'>, string> = {
  /* Acknowledges they were close without inventing credit. */
  partial: 'Almost…',
  fail: 'Not quite…',
};

/**
 * What Knowie says about the attempt: the judgement itself, then the nudge.
 * The nudge points without solving — that is the hint ladder's job, not the
 * result sheet's. On a pass the sheet shows both; on a miss the title comes
 * from MISS_TITLE and the nudge is the summary.
 */
export type Feedback = {
  headline: string;
  detail: string;
};

export type ScriptedAttempt = {
  verdict: Verdict;
  /**
   * What the mock speech-to-text "heard". Written so a miss could read as "it
   * misheard me" rather than "I failed" (Voice UX Reference, principle 4).
   * Empty string when the verdict is `empty`.
   *
   * **Not currently shown.** The result sheet has nowhere to put it — see
   * SPEC.md's Open section. Kept so the copy is ready if it comes back.
   *
   * The split is deliberate: `partial` transcripts are coherent but
   * incomplete; `fail` transcripts show visible speech-to-text mangling.
   */
  transcript: string;
  /**
   * Shown on the result sheet. Absent on `empty`, which never reaches one.
   */
  feedback?: Feedback;
};

export type RecallQuestion = {
  id: string;
  /** Knowie's question, spoken through a calloutBubble. */
  prompt: string;
  /** Shown only on the reveal screen, after the ladder is exhausted. */
  answer: string;
  /** Two tiers, in order. Each one viewed reduces the XP recorded. */
  hints: [string, string];
  /**
   * The verdicts this question plays, one per attempt, in order. A question
   * whose last attempt is not a pass ends at the reveal.
   */
  attempts: ScriptedAttempt[];
  /**
   * Knowie's line on the summary if this question is the one he recalls: the
   * best part of the student's passing explanation, played back in their own
   * terms, so it is clear he was listening. Written against the passing
   * transcript above — the mock never hears the real answer.
   */
  recall: string;
};

/** The study-plan section this recall step follows. */
export const SECTION_TITLE = 'Network Basics';

/**
 * Knowie's line on the reveal screen. Generous on purpose: the student reached
 * it by running out of hints, which is the worst moment in the loop to sound
 * disappointed. It promises nothing the prototype doesn't do — there is no
 * spaced repetition here to come back to.
 */
export const REVEAL_LINE = "No shame in this one. Here's the answer, so you've got it for next time.";

/**
 * Knowie's line on the summary when there is no passed answer to recall —
 * every question skipped, missed or revealed. Warm, and it claims nothing:
 * praising an explanation that never landed would read as not listening,
 * which is the opposite of what the recall line is for.
 */
export const SUMMARY_FALLBACK_LINE =
  'Thanks for talking these through with me. Every explanation makes the next one easier.';

export const RECALL_SCRIPT: RecallQuestion[] = [
  /* Q1 — passes first try. The session opens on a win. */
  {
    id: 'router-vs-switch',
    prompt: "What does a router do that a switch doesn't?",
    answer:
      'A router moves traffic between different networks, using IP addresses. A switch only moves traffic inside one network, using MAC addresses.',
    hints: [
      'Think about how far each one can send a packet.',
      'One of them only ever works inside a single network. Which addresses does the other one need?',
    ],
    attempts: [
      {
        verdict: 'pass',
        transcript:
          'a router sends traffic between networks using ip addresses and a switch just moves it around inside one network with mac addresses',
        feedback: {
          headline: "That's it.",
          detail: "A router crosses networks; a switch never leaves the one it's on.",
        },
      },
    ],
    recall:
      'You said a router sends traffic between networks, and a switch just moves it around inside one. That’s the whole difference.',
  },

  /* Q2 — empty first (a free retry), then partial, then passes after hint 1. */
  {
    id: 'ip-and-mac',
    prompt: 'Why does a device need both an IP address and a MAC address?',
    answer:
      'The IP address says which network the device is on, so traffic can be routed across the internet. The MAC address identifies the exact device on that final local network, for the last hop.',
    hints: [
      "One of the two changes as a packet crosses the internet. The other one doesn't.",
      'Think about which address is still needed at the very last step, once the packet has already reached the right network.',
    ],
    attempts: [
      { verdict: 'empty', transcript: '' },
      {
        verdict: 'partial',
        transcript: 'the ip address is how the packet finds the right network',
        feedback: {
          headline: 'Right about the IP address.',
          detail: "There's a second address doing a different job.",
        },
      },
      {
        verdict: 'pass',
        transcript:
          'the ip address gets it to the right network and then the mac address picks out the actual device on that network',
        feedback: {
          headline: "That's it.",
          detail: 'IP gets it to the network, MAC finds the device on it.',
        },
      },
    ],
    recall:
      'I liked how you split the jobs: the IP address gets it to the right network, and the MAC address picks out the device.',
  },

  /*
   * Q3 — rides the full ladder to reveal: attempt, hint 1, attempt, hint 2,
   * attempt, reveal. This is the question the reveal screen is built against.
   * Kept from the Figma screens, which use it throughout.
   */
  {
    id: 'brute-force',
    prompt: 'What makes a password resistant to brute-force attacks?',
    answer:
      'Length. Every extra character multiplies the number of guesses an attacker has to try, so a long passphrase beats a short password full of symbols.',
    hints: [
      "It isn't about how strange the characters look.",
      'Think about what happens to the number of possible combinations each time you add one more character.',
    ],
    attempts: [
      {
        verdict: 'fail',
        transcript:
          "it needs symbols and numbers and capitals so it's harder to brew tea force it",
        feedback: {
          headline: "That's not the main thing here.",
          detail: 'Something else about the password matters much more.',
        },
      },
      {
        verdict: 'partial',
        transcript: 'you make it complicated so there are more options to get through',
        /* Figma screen 07's copy, kept verbatim — it is the one piece of
           result writing the file already contains. The sheet shows the
           detail as its summary; the headline is not shown on a miss. */
        feedback: {
          headline: 'Close, you named complexity.',
          detail: "There's another factor that matters even more here.",
        },
      },
      {
        verdict: 'fail',
        transcript: 'more carrot ters and mixed case gives you more combinations',
        /* Both hints are spent by the time this lands, so the ladder goes
           straight to the reveal and this copy is never shown on the result
           sheet. Written anyway, so the attempt is not a special case. */
        feedback: {
          headline: 'Still not the one.',
          detail: "That's the same idea again, and it isn't what matters most.",
        },
      },
    ],
    /* The script never passes this one; only a forced verdict can. */
    recall:
      'You got to the heart of it: every extra character means far more guesses to get through.',
  },

  /* Q4 — passes. The session ends on a win. */
  {
    id: 'dns',
    prompt: 'What job does DNS do?',
    answer:
      'DNS turns a domain name a person can remember into the IP address a machine needs in order to connect.',
    hints: [
      'It sits between what you type and where your computer actually goes.',
      'Think about what has to happen after you type a site name, but before any traffic leaves your device.',
    ],
    attempts: [
      {
        verdict: 'pass',
        transcript:
          'dns takes the domain name you type and looks up the ip address so your computer knows where to connect',
        feedback: {
          headline: 'Exactly right.',
          detail: "Name in, address out — that's the whole job.",
        },
      },
    ],
    recall:
      'You put DNS perfectly: it takes the name you type and looks up the address your computer needs.',
  },
];

/** Every question in the session. Fixed at 4 — see sprint-context.md. */
export const QUESTION_COUNT = RECALL_SCRIPT.length;

/**
 * The line Knowie closes the session with.
 *
 * Of the questions the student passed, the one that took the fewest hints —
 * their strongest explanation — and on a tie the earliest, since remembering
 * the first answer is the clearest sign he was listening all along. With no
 * pass to recall, the canned line.
 *
 * `passes` is one entry per question in session order: the hints spent on it
 * if it passed, `undefined` if it didn't.
 */
export function pickRecallLine(passes: (number | undefined)[]): string {
  let best: { index: number; hints: number } | undefined;
  passes.forEach((hints, index) => {
    if (hints === undefined) return;
    if (!best || hints < best.hints) best = { index, hints };
  });
  return best ? RECALL_SCRIPT[best.index].recall : SUMMARY_FALLBACK_LINE;
}
