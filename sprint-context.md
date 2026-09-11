# Sprint Context

Voice-based active recall for Knowunity: after a study plan section, the student explains what they just learned out loud and Knowie judges it in text.
This file is the settled scope. Anything not listed here is still open, don't assume it.

## Committed concept

A 4-question voice recall step, one question per quiz just completed in the section, each answer judged pass, partial, or fail with a two-tier hint-and-retry ladder before reveal, ending in a summary that reflects hint use in the XP shown.

## Where the recall step lives

Chained automatically right after the last quiz in a study plan section, and always reachable on demand via the persistent "Explain Out Loud" node in that section's path.

## Decisions

- Focus is the happy path, student knows the material and nails it. Edge cases get noted, not designed, per the kickoff scope guidance.
- Session is fixed at 4 questions, one per quiz in the section just completed, because it mirrors the path's existing structure and keeps the session from feeling overwhelming, rather than the brief's flexible 3-5 term range.
- Recall both auto-continues after the last quiz and stays live as the standalone node, because auto-continue catches the student while the material is fresh, and the node lets them redo it or start later without redoing the quizzes.
- Recording is press-and-hold to talk, release to send for processing, satisfying the brief's push-to-talk-with-explicit-send constraint in one gesture.
- Judgment is pass, partial, or fail per the kickoff spec, not collapsed to binary correct/incorrect.
- Partial and fail both route into the hint ladder the same way, only pass skips straight to the next question.
- Hint ladder is two tiers before reveal: hint 1, re-attempt, hint 2, re-attempt, then reveal. Viewing a hint routes the student back into a re-attempt, it does not auto-reveal or auto-advance.
- Each hint viewed reduces the XP recorded for that question, so two hints costs more than one, because a hinted answer can't count the same as unaided recall in the summary.
- Summary screen shows XP, number correct, and time, so the hint-XP tradeoff above is visible to the student, not just tracked internally.
- Leaving mid-session surfaces the existing multi-reason abandon sheet (already shipped in the beta) rather than a plain confirm dialog, because cutting it would be a regression, not a scope cut.
- Screens use the components already defined in design-system.md for this feature, not new ones invented ad hoc, because many of its states are still pending and gaps need to be flagged, not filled in silently.

## Not building

- Not building the optional "say it back" repeat-the-answer step.
- Not building real speech-to-text or real judging (mocked transcript and verdict, but latency still needs a designed wait state).
- Not building auto-endpointing (no detecting when the student stops talking).
- Not building conversation branching if the student says something off-topic, this stays recall-only.
